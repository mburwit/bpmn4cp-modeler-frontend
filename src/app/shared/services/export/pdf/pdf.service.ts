import {Injectable} from '@angular/core';
import {jsPDF} from "jspdf";
import autoTable, {RowInput, UserOptions} from 'jspdf-autotable';
import {PDFDocument} from "pdf-lib";
import './fonts/ElementalEnd';
import './fonts/Roboto';

// mm
const PAGE_MARGIN = {
    top: 25,
    left: 20,
    bottom: 20,
    right: 20
}

// mm
const HEADER = {
    top: 3,
    left: 15,
    right: 15,
    height: 15
}

const a4scale = (pdfData) => {
    return function (value) {
        return value * pdfData.jsPdf.internal.pageSize.width / 210;
    }
}

const metrics = {
    pxToMm: function (px) {
        return 0.2645833333 * px;
    },
    mmToPx: function (mm) {
        return mm / 0.2645833333;
    }
}

const HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;'
};

interface Item {
    name: string;
    items: Map<string, Item>;
}

export interface PdfOptions {
    docName: string;
    modelSvg?: string;
    bpmnXml?: string | Document;
    colors?: {
        primary?: string;
        secondary?: string;
    }
}

interface PdfData {
    jsPdf?: jsPDF;
    pdfDoc?: PDFDocument;
    options: PdfOptions;
    lastChapter: number;
    numberOfPages: number;
    cursor: {
        x: number,
        y: number
    }
}

@Injectable({
    providedIn: 'root'
})
export class PdfService {

    constructor() {
    }

    savePdf(options: PdfOptions) {
        return PDFDocument.create().then(pdfDoc => {
            return {
                options: options,
                pdfDoc: pdfDoc,
                lastChapter: 0,
                numberOfPages: 0,
                cursor: {
                    x: 0, y: 0
                }
            }
        })
            .then(PdfService.addA4ModelSvg)
            .then(PdfService.addStagesAndActors)
            .then(PdfService.addQualityIndicators)
            .then(PdfService.addBibliography)
            .then(PdfService.addModelSvg)
            .then(PdfService.outputPdf);
    }

    private static appendJsPdf(pdfData: PdfData) {
        return PDFDocument.load(pdfData.jsPdf.output('arraybuffer')).then(content => {
            return pdfData.pdfDoc.copyPages(content, content.getPageIndices());
        }).then(pages => {
            pages.forEach((page) => pdfData.pdfDoc.addPage(page));
            pdfData.numberOfPages += pages.length;
            return pdfData;
        });
    }

    private static addHeaderAndFooter(pdfData: PdfData) {
        const pageOffset = pdfData.pdfDoc ? pdfData.pdfDoc.getPages().length : 0;
        const pageCount = pdfData.jsPdf.internal.pages.length;
        for (let i = 1; i < pageCount; i++) {
            pdfData.jsPdf.setFont('Roboto', 'italic')
            pdfData.jsPdf.setFontSize(10)
            pdfData.jsPdf.setTextColor("#000");
            pdfData.jsPdf.setPage(i);
            pdfData.jsPdf.text(`Page ${i + pageOffset}`,
                pdfData.jsPdf.internal.pageSize.width - a4scale(pdfData)(HEADER.right),
                a4scale(pdfData)(HEADER.top + HEADER.height - 1),
                {
                    align: 'right',
                    baseline: 'bottom'
                });
            pdfData.jsPdf.text(`${pdfData.options.docName}`,
                a4scale(pdfData)(HEADER.left),
                a4scale(pdfData)(HEADER.top + HEADER.height - 1),
                {
                    align: 'left',
                    baseline: 'bottom',
                    maxWidth: (pdfData.jsPdf.internal.pageSize.width - a4scale(pdfData)(HEADER.left + HEADER.right)) * 0.75
                });
            pdfData.jsPdf.setLineWidth(0.25);
            pdfData.jsPdf.setDrawColor("#00000080");
            pdfData.jsPdf.line(
                a4scale(pdfData)(HEADER.left),
                a4scale(pdfData)(HEADER.top + HEADER.height),
                pdfData.jsPdf.internal.pageSize.width - a4scale(pdfData)(HEADER.right),
                a4scale(pdfData)(HEADER.top + HEADER.height));
        }
        return Promise.resolve(pdfData);
    }

    private static addA4ModelSvg(pdfData: PdfData) {
        return PdfService.addModelSvg(pdfData, true);
    }

    private static addModelSvg(pdfData: PdfData, fitPageSize?: boolean) {
        if (pdfData.options.modelSvg) {
            const currentSvg = pdfData.options.modelSvg;
            const svgContainer = document.createElement("div");
            svgContainer.innerHTML = currentSvg.trim().slice(
                currentSvg.indexOf("<svg ")
            );
            const svgElement = svgContainer.firstElementChild;
            svgElement.getBoundingClientRect(); // force layout calculation
            const originalWidth = metrics.pxToMm(svgElement["width"].baseVal.value);
            const originalHeight = metrics.pxToMm(svgElement["height"].baseVal.value);
            let scaledWidth = originalWidth;
            let scaledHeight = originalHeight;
            if (fitPageSize) {
                scaledWidth = (originalWidth > originalHeight ? 297 : 210) - PAGE_MARGIN.left - PAGE_MARGIN.right;
                scaledHeight = (originalWidth > originalHeight ? 210 : 297) - PAGE_MARGIN.top - PAGE_MARGIN.bottom;
            }
            pdfData.jsPdf = new jsPDF(
                originalWidth > originalHeight ? "landscape" : "portrait",
                "mm",
                fitPageSize ? "a4" : [
                    originalWidth + PAGE_MARGIN.left + PAGE_MARGIN.right,
                    originalHeight + PAGE_MARGIN.top + PAGE_MARGIN.bottom
                ]);
            let chain = pdfData.jsPdf.svg(svgElement, {
                x: PAGE_MARGIN.left,
                y: PAGE_MARGIN.top,
                width: scaledWidth,
                height: scaledHeight
            }).then(() => {
                svgContainer.remove();
                return pdfData;
            });
            if (fitPageSize) {
                chain = chain.then(PdfService.addHeaderAndFooter)
            }
            return chain.then(PdfService.appendJsPdf);
        }
    }

    private static addStagesAndActors(pdfData: PdfData) {
        const tableRows = function (rowItems: IterableIterator<Item>) {
            return Array.from(rowItems).sort((a, b) => {
                return (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));
            }).map(rowItem =>
                [
                    {content: rowItem.name, styles: {}},
                    {content: Array.from(rowItem.items.values()).map(item => item.name).sort().join(", "), styles: {}}
                ]
            );
        }

        if (pdfData.options.bpmnXml) {
            pdfData.options.bpmnXml = PdfService.parseXml(pdfData.options.bpmnXml);
            const data = PdfService.loadStagesAndActors(pdfData.options.bpmnXml);
            if (Object.keys(data).length > 0) {
                PdfService.newDocument(pdfData);
                PdfService.addChapter(pdfData, `Stages & Actors`);
                if (data.stages.size > 0) {
                    PdfService.addSection(pdfData, 1, `Stages`);
                    PdfService.addTable(
                        pdfData,
                        [[{content: `Stage`}, {content: `Actors involved`}]],
                        tableRows(data.stages.values())
                    );
                }
                if (data.actors.size > 0) {
                    PdfService.addSection(pdfData, 2, `Actors`);
                    PdfService.addTable(
                        pdfData,
                        [[{content: `Stage`}, {content: `Actors involved`}]],
                        tableRows(data.actors.values())
                    );
                }
                return Promise.resolve(pdfData).then(PdfService.addHeaderAndFooter).then(PdfService.appendJsPdf);
            }
        }
        return Promise.resolve(pdfData);
    }

    private static addQualityIndicators(pdfData: PdfData) {
        if (pdfData.options.bpmnXml) {
            pdfData.options.bpmnXml = PdfService.parseXml(pdfData.options.bpmnXml);
            const data = PdfService.loadQualityIndicators(pdfData.options.bpmnXml);
            if (data.size > 0) {
                PdfService.newDocument(pdfData);
                PdfService.addChapter(pdfData, `Quality Indicators`);
                let counter = 0;
                data.forEach(qi => {
                    counter++;
                    PdfService.addTable(
                        pdfData,
                        [[{
                            content: `${pdfData.lastChapter}.${counter} ${qi.name.substring(0, 1).toUpperCase()}${qi.name.substring(1)}`,
                            colSpan: 2
                        }]],
                        Object.keys(qi).map(qiProperty => {
                            return [
                                {
                                    content: `${qiProperty.substring(0, 1).toUpperCase()}${qiProperty.substring(1)}`,
                                    styles: {}
                                },
                                {content: `${qi[qiProperty]}`, styles: {}}
                            ]
                        }));
                });
                return Promise.resolve(pdfData).then(PdfService.addHeaderAndFooter).then(PdfService.appendJsPdf);
            }
        }
        return Promise.resolve(pdfData);
    }

    private static addBibliography(pdfData: PdfData) {
        if (pdfData.options.bpmnXml) {
            pdfData.options.bpmnXml = PdfService.parseXml(pdfData.options.bpmnXml);
            const bibItems = PdfService.loadBibliography(pdfData.options.bpmnXml);
            if (bibItems.length > 0) {
                pdfData.lastChapter += 1;
                let html = "<section class='chapter'>";
                html += `  <h1>${pdfData.lastChapter}. References</h1>`;
                html += `  <div class="bibliography">`;
                bibItems.forEach((bibItem) => {
                    html += `<div class="label">[${bibItem.refLabel}]</div><div>${bibItem.parsed}`;
                    if (bibItem.link) {
                        html += ` (<a class="link" href="${bibItem.link}">${bibItem.link}</a>)`;
                    }
                    html += "</div>";
                });
                html += "  </div>";
                return PdfService.appendHtmlContainer(pdfData, html);
            }
        }
        return Promise.resolve(pdfData);
    }

    private static appendHtmlContainer(pdfData: PdfData, innerHtml: string) {
        const containerDiv = document.createElement("div");
        pdfData.jsPdf = new jsPDF("portrait", "px", "a4");
        const scale = a4scale(pdfData);
        const divWidth = scale(210 - PAGE_MARGIN.left - PAGE_MARGIN.right);
        containerDiv.setAttribute("style", `width: ${divWidth}px; background-color: #fff;`);
        containerDiv.setAttribute("class", `${document.body.getAttribute("class")} pdf`);
        containerDiv.innerHTML = innerHtml;
        return pdfData.jsPdf.html(containerDiv, {
            x: 0,
            y: 0,
            margin: [scale(PAGE_MARGIN.top), scale(PAGE_MARGIN.right), scale(PAGE_MARGIN.bottom), scale(PAGE_MARGIN.left)],
            autoPaging: 'text',
            jsPDF: pdfData.jsPdf,
            width: divWidth
        }).then(() => {
            //document.body.getElementsByClassName("cdk-overlay-container")[0].appendChild(containerDiv);
            containerDiv.remove();
            return pdfData;
        }).then(PdfService.addHeaderAndFooter).then(PdfService.appendJsPdf);
    }

    private static outputPdf(pdfData: PdfData) {
        return pdfData.pdfDoc.save().then(pdfBytes => {
            return new Blob([pdfBytes], {type: 'application/pdf'});
        });
    }

    private static parseXml(xmlInput: string | Document) {
        if (typeof xmlInput === "string") {
            if (typeof window.DOMParser != "undefined") {
                return (new DOMParser()).parseFromString(xmlInput, "text/xml");
            } else {
                throw new Error("No XML parser found");
            }
        }
        return xmlInput;
    }

    private static loadStagesAndActors(xmlDoc: Document) {
        const result: { stages?: Map<string, Item>, actors?: Map<string, Item> } = {};
        if (xmlDoc) {
            const stageElements = xmlDoc.getElementsByTagName("bpmn2:categoryValue");
            if (stageElements.length > 0) {
                result.stages = new Map<string, Item>();
                result.actors = new Map<string, Item>();
                for (let i = 0; i < stageElements.length; i++) {
                    const stageId = stageElements[i].getAttribute('id');
                    const stageName = stageElements[i].getAttribute('value') === "" ?
                        stageElements[i].getAttribute('id') : stageElements[i].getAttribute('value');
                    const stage = {
                        name: stageName,
                        items: new Map<string, Item>()
                    }
                    const actorElements = stageElements[i].getElementsByTagName("cp:actor");
                    if (actorElements.length > 0) {
                        for (let i = 0; i < actorElements.length; i++) {
                            const actorId = `${actorElements[i].getAttribute('codeSystem')}|${actorElements[i].getAttribute('code')}`;
                            const actorName = actorElements[i].getAttribute('name') === null ?
                                "no name" : actorElements[i].getAttribute('name');
                            const actor = result.actors.get(actorId) || {
                                name: actorName,
                                items: new Map<string, Item>()
                            };
                            stage.items.set(actorId, actor);
                            actor.items.set(stageId, stage);
                            result.actors.set(actorId, actor);
                        }
                    }
                    result.stages.set(stageId, stage);
                }
            }
        }
        return result;
    }

    private static loadQualityIndicators(xmlDoc: Document) {
        const result: Map<string, any> = new Map();
        if (xmlDoc) {
            const qiElements = xmlDoc.getElementsByTagName("cp:qualityIndicator");
            if (qiElements.length > 0) {
                for (let i = 0; i < qiElements.length; i++) {
                    const qiId = qiElements[i].getAttribute('id');
                    const qiName = qiElements[i].getAttribute('bpmn2:name') === "" ?
                        qiElements[i].getAttribute('id') : qiElements[i].getAttribute('bpmn2:name');
                    const qiDocElement = qiElements[i].getElementsByTagName("bpmn2:documentation");
                    const qiDocumentation = qiDocElement.length > 0 ? qiDocElement[0].innerHTML : "";
                    const qiDefElement = qiElements[i].getElementsByTagName("cp:qIDefinition")[0] || undefined;
                    const qi = {
                        name: qiName,
                        documentation: qiDocumentation,
                        text: qiDefElement ? qiDefElement.getAttribute("text") : undefined,
                        numerator: qiDefElement ? qiDefElement.getAttribute("numerator") : undefined,
                        denumerator: qiDefElement ? qiDefElement.getAttribute("denumerator") : undefined
                    };
                    Object.keys(qi).forEach(key => (qi[key] === undefined || qi[key] === "" || qi[key] === null) && delete qi[key]);
                    result.set(qiId, qi)
                }
            }
        }
        return result;
    }

    private static loadBibliography(xmlDoc: Document) {
        const result = [];
        if (xmlDoc) {
            const bibElements = xmlDoc.getElementsByTagName("cp:bibliographyItem");
            for (let i = 0; i < bibElements.length; i++) {
                result.push({
                    refLabel: bibElements[i].getAttribute('refLabel'),
                    text: bibElements[i].getAttribute('text') || "",
                    link: bibElements[i].getAttribute('link'),
                    parsed: PdfService.parseMarkup(bibElements[i].getAttribute('text') || '')
                });
            }
        }
        return result.sort((a, b) => a.refLabel - b.refLabel);
    }

    private static parseMarkup(markupText: string) {
        if (!markupText) {
            return markupText;
        }
        // we tokenize the description to extract text, HTML and markdown links
        // text, links and new lines are handled seperately

        const escaped = [], shortened = [];

        // match markdown [{TEXT}]({URL}) and HTML links <a href="{URL}">{TEXT}</a>
        const pattern = /(?:\[([^\]]+)\]\((https?:\/\/[^)]+)\))|(?:<a href="(https?:\/\/[^"]+)">(.+?(?=<\/))<\/a>)/gi;

        let index = 0;
        let match;
        let link, text;

        while ((match = pattern.exec(markupText))) {

            // escape + insert text before match
            if (match.index > index) {
                escaped.push(PdfService.escapeText(markupText.substring(index, match.index)));
            }

            link = match[2] && encodeURI(match[2]) || match[3];
            text = match[1] || match[4];

            // insert safe link
            // escaped.push(`<a class="link" href="${link}">${PdfService.escapeText(text)}</a>`);
            escaped.push(PdfService.escapeText(text) + ' (<span class="link">' + link + '</span>)');

            index = match.index + match[0].length;
        }

        // escape and insert text after last match
        if (index < markupText.length) {
            escaped.push(PdfService.escapeText(markupText.substring(index)));
        }
        return escaped.join('');
    }

    private static escapeText(text) {
        let match, index = 0, escaped = [];
        // match new line <br/> <br /> <br.... /> etc.
        const pattern = /<br\s*\/?>/gi;
        while ((match = pattern.exec(text))) {
            if (match.index > index) {
                escaped.push(PdfService.escapeHTML(text.substring(index, match.index)));
            }
            escaped.push('<br />');
            index = match.index + match[0].length;
        }
        if (index < text.length) {
            escaped.push(PdfService.escapeHTML(text.substring(index)));
        }
        return escaped.join('');
    }

    private static escapeHTML(str) {
        str = '' + str;
        return str && str.replace(/[&<>"']/g, function (match) {
            return HTML_ESCAPE_MAP[match];
        });
    }

    private static newDocument(pdfData: PdfData) {
        pdfData.jsPdf = new jsPDF("portrait", "mm", "a4");
        pdfData.cursor = {x: PAGE_MARGIN.left, y: PAGE_MARGIN.top};
    }

    private static newPage(pdfData: PdfData, ifSpaceLessThan?: number) {
        ifSpaceLessThan = ifSpaceLessThan || -1;
        if (ifSpaceLessThan === -1 || pdfData.jsPdf.internal.pageSize.height - PAGE_MARGIN.top - PAGE_MARGIN.bottom - pdfData.cursor.x < ifSpaceLessThan) {
            pdfData.jsPdf.addPage("a4", "portrait");
            pdfData.cursor = {x: PAGE_MARGIN.left, y: PAGE_MARGIN.top};
        }
    }

    private static addChapter(pdfData: PdfData, title: string) {
        PdfService.newPage(pdfData, 20);
        pdfData.lastChapter += 1;
        pdfData.jsPdf.setFont('Roboto', 'bold');
        pdfData.jsPdf.setFontSize(14);
        pdfData.jsPdf.setTextColor(pdfData.options.colors && pdfData.options.colors.primary || "#006666");
        const margin = {
            top: 2,
            bottom: 2
        }
        const lineHeight = pdfData.jsPdf.getLineHeight() / pdfData.jsPdf.internal.scaleFactor + margin.top + margin.bottom;
        pdfData.jsPdf.text(
            `${pdfData.lastChapter}. ${title}`,
            pdfData.cursor.x,
            pdfData.cursor.y + margin.top,
            {
                baseline: 'top',
            });
        pdfData.cursor.y += lineHeight;
    }

    private static addSection(pdfData: PdfData, sectionCount: number, title: string) {
        PdfService.newPage(pdfData, 20);
        pdfData.jsPdf.setFont('Roboto', 'normal');
        pdfData.jsPdf.setFontSize(12);
        pdfData.jsPdf.setTextColor(pdfData.options.colors && pdfData.options.colors.primary || "#006666");
        const margin = {
            top: 2,
            bottom: 2
        }
        const lineHeight = pdfData.jsPdf.getLineHeight() / pdfData.jsPdf.internal.scaleFactor + margin.top + margin.bottom;
        pdfData.jsPdf.text(
            `${pdfData.lastChapter}.${sectionCount}. ${title}`,
            pdfData.cursor.x,
            pdfData.cursor.y + margin.top,
            {
                baseline: 'top',
            });
        pdfData.cursor.y += lineHeight;
    }

    private static addTable(pdfData: PdfData, head: RowInput[], body: RowInput[], marginTop?: number, marginBottom?: number, options?: UserOptions) {
        const margin = {
            top: PAGE_MARGIN.top + (marginTop || 0),
            left: PAGE_MARGIN.left + 2,
            bottom: marginBottom || 4,
            right: PAGE_MARGIN.right + 2
        }
        const finalOptions = {...{
                pageBreak: "avoid",
                headStyles: {
                    fillColor: pdfData.options.colors && pdfData.options.colors.primary || "#006666",
                    textColor: "#FFF"
                }
            }, ...options, ...{
                head: head,
                body: body,
                margin: margin,
                startY: pdfData.cursor.y + (marginTop || 0),
                didDrawPage: (data) => {
                    pdfData.cursor.y = data.cursor.y + margin.bottom;
                }
            }};
        autoTable(pdfData.jsPdf, finalOptions as UserOptions);
    }

}
