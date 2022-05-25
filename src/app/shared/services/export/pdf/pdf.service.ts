import {Injectable} from '@angular/core';
import {jsPDF} from "jspdf";
import {PDFDocument} from "pdf-lib";
import './fonts/ElementalEnd';
import './fonts/Roboto';

/*
    A4 - portrait:
        => 595.28 x 841.89 px
 */

const PAGE_MARGIN = {
    left: 50,
    right: 50,
    top: 50,
    bottom: 75
}

const HEADER = {
    left: 30,
    right: 30,
    top: 5,
    height: 30
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
}

interface PdfData {
    jsPdf?: jsPDF;
    pdfDoc?: PDFDocument;
    options: PdfOptions;
    lastChapter: number;
    numberOfPages: number;
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
                numberOfPages: 0
            }
        }).then(PdfService.addModelSvg).then(PdfService.addStagesAndActors).then(PdfService.addBibliography).then(PdfService.outputPdf);
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
            pdfData.jsPdf.setFontSize(8)
            pdfData.jsPdf.setPage(i);
            pdfData.jsPdf.text(`Page ${i + pageOffset}`, pdfData.jsPdf.internal.pageSize.width - HEADER.right, HEADER.top + HEADER.height - 1, {
                align: 'right',
                baseline: 'bottom'
            });
            pdfData.jsPdf.text(`${pdfData.options.docName}`, HEADER.left, HEADER.top + HEADER.height - 1, {
                align: 'left',
                baseline: 'bottom',
                maxWidth: (pdfData.jsPdf.internal.pageSize.width - HEADER.left - HEADER.right) * 0.75
            });
            pdfData.jsPdf.setLineWidth(0.5);
            pdfData.jsPdf.setDrawColor("#00000080");
            pdfData.jsPdf.line(HEADER.left, HEADER.top + HEADER.height, pdfData.jsPdf.internal.pageSize.width - HEADER.right, HEADER.top + HEADER.height);
        }
        return Promise.resolve(pdfData);
    }

    private static addModelSvg(pdfData: PdfData) {
        if (pdfData.options.modelSvg) {
            const currentSvg = pdfData.options.modelSvg;
            const svgContainer = document.createElement("div");
            svgContainer.innerHTML = currentSvg.trim().slice(
                currentSvg.indexOf("<svg ")
            );
            const svgElement = svgContainer.firstElementChild;
            svgElement.getBoundingClientRect(); // force layout calculation
            const width = svgElement["width"].baseVal.value + PAGE_MARGIN.left + PAGE_MARGIN.right;
            const height = svgElement["height"].baseVal.value + PAGE_MARGIN.top + PAGE_MARGIN.bottom;
            pdfData.jsPdf = new jsPDF(width > height ? "landscape" : "portrait", "px", [width, height]);
            return pdfData.jsPdf.svg(svgElement, {
                x: PAGE_MARGIN.left,
                y: PAGE_MARGIN.top,
            }).then(() => {
                svgContainer.remove();
                return pdfData;
            }).then(PdfService.appendJsPdf);
        }
    }

    private static addStagesAndActors(pdfData: PdfData) {
        const tableRows = function(rowItems: IterableIterator<Item>) {
            let result = "";
            Array.from(rowItems).sort((a, b) => {
                return (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));
            }).forEach((rowItem) => {
                result += `<tr><td><div>${rowItem.name}</div></td><td><div>${Array.from(rowItem.items.values()).map(item => item.name).sort().join(", ")}</div></td></tr>`;
            });
            return result;
        }

        if (pdfData.options.bpmnXml) {
            pdfData.options.bpmnXml = PdfService.parseXml(pdfData.options.bpmnXml);
            const data = PdfService.loadStagesAndActors(pdfData.options.bpmnXml);
            if (Object.keys(data).length > 0) {
                pdfData.lastChapter += 1;
                let html = "<section class='chapter'>";
                html += `  <h1>${pdfData.lastChapter}. Stages & Actors</h1>`;
                if (data.stages.size > 0) {
                    html += `  <h2>${pdfData.lastChapter}.1 Stages</h2>`;
                    html += "  <table>" +
                        "    <tr class='header'>" +
                        "      <th><div>Stage</div></th>" +
                        "      <th><div>Actors involved</div></th>" +
                        "    </tr>";
                    html += tableRows(data.stages.values());
                    html += "  </table>";
                    // data.stages.forEach((stage, id) => {
                    //     html += `<h3>${stage.name}</h3>`;
                    //     if (stage.items && stage.items.size > 0) {
                    //         html += `  <p>Actors involved:`;
                    //         html += `    <ul>`;
                    //         stage.items.forEach(actor => {
                    //             html += `      <li>${actor.name}</li>`;
                    //         });
                    //         html += `    </ul>`;
                    //         html += `  </p>`;
                    //     } else {
                    //         html += `<p>No actors involved</p>`;
                    //     }
                    // });
                }
                if (data.actors.size > 0) {
                    html += `  <h2>${pdfData.lastChapter}.2 Actors</h2>`;
                    html += "  <table>" +
                        "    <tr class='header'>" +
                        "      <th><div>Actor</div></th>" +
                        "      <th><div>Stages involved</div></th>" +
                        "    </tr>";
                    html += tableRows(data.actors.values());
                    html += "  </table>";
                    // data.actors.forEach((actor, id) => {
                    //     if (actor.items && actor.items.size > 0) {
                    //         html += `<h3>${actor.name}</h3>`;
                    //         html += `  <p>Involved in:`;
                    //         html += `    <ul>`;
                    //         actor.items.forEach(stage => {
                    //             html += `      <li>${stage.name}</li>`;
                    //         });
                    //         html += `    </ul>`;
                    //         html += `  </p>`;
                    //     }
                    // });
                }
                html += "</section>";
                return PdfService.appendHtmlContainer(pdfData, html);
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
                        html += ` (<span class="link">${bibItem.link}</span>)`;
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
        const divWidth = 445 - PAGE_MARGIN.left - PAGE_MARGIN.right;
        containerDiv.setAttribute("style", `width: ${divWidth}px; background-color: #fff;`);
        containerDiv.setAttribute("class", `${document.body.getAttribute("class")} pdf`);
        containerDiv.innerHTML = innerHtml;
        pdfData.jsPdf = new jsPDF("portrait", "px", "a4");
        return pdfData.jsPdf.html(containerDiv, {
            x: 0,
            y: 0,
            margin: [PAGE_MARGIN.top, PAGE_MARGIN.right, PAGE_MARGIN.bottom, PAGE_MARGIN.left],
            jsPDF: pdfData.jsPdf,
            width: divWidth
        }).then(() => {
            // document.body.getElementsByClassName("cdk-overlay-container")[0].appendChild(containerDiv);
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
            // escaped.push('<a href="' + link + '" target="_blank">' + PdfService.escapeText(text) + '</a>');
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
        return str && str.replace(/[&<>"']/g, function(match) {
            return HTML_ESCAPE_MAP[match];
        });
    }
}
