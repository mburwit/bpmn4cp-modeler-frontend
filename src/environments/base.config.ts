type Protocol = "http" | "https" | "ws" | "wss";

type Host = string;

export type Port = 80 | 443 | 8080 | 8443 | 2345 | 1234 | 4200;

type Path = string;

export interface BaseConfig {
  readonly protocol: Protocol;
  readonly host: Host;
  readonly port: Port;
  readonly base: Path;
  readonly path: Path;
}

type EndpointBaseConfig = BaseConfig & {
  readonly url: string;
};

const toUrl = (config: BaseConfig): string => {
  const toPath = (path: string): string => {
    if (path && (path.trim().length > 0)) {
      // add leading slash
      if (!path.trim().startsWith("/")) {
        path = "/".concat(path.trim());
      }
      // remove trailing slash
      if (path.trim().endsWith("/")) {
        path = path.trim().substr(0, path.trim().lastIndexOf("/"));
      }
      return path;
    }

    return "";
  };
  let url = `${config.protocol}://${config.host}`;
  if (config.port !== 80 && config.port !== 443) {
    url += `:${config.port}`;
  }
  return `${url}${toPath(config.base).concat(toPath(config.path))}`;
};

const defaultServer: BaseConfig = {
  protocol: "http",
  host: "localhost",
  port: 80,
  base: "",
  path: ""
};

export const base = (config: BaseConfig | undefined) => {
  if (config === undefined) {
    config = defaultServer;
  }
  return {
    entryPoint: `${toUrl(config)}`,
    server: config
  };
};
