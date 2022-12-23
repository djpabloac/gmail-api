/* eslint-disable sort-keys-fix/sort-keys-fix */
interface ConfigBase {
  enabledPrintConsole: boolean;
  enabledUnread: boolean;
  fileExclude: string[];
  isDevelopment: boolean;
  pathDirNameDownload: string;
}

interface Config extends ConfigBase {
  stage: {
    enabledMessageUnread: boolean;
    enabledUpload: boolean;
  };
  endpoint: {
    applyingApi: string;
    applying: string;
  }
}

const Env = {
  DEVELOPMENT: 'development',
  STAGING    : 'staging',
  PRODUCTION : 'production'
}

const configBase: ConfigBase = {
  enabledPrintConsole: process.env.ENABLED_PRINT_CONSOLE === 'true',
  enabledUnread      : process.env.ENABLED_UNREAD === 'true',
  fileExclude        : [
    '.DS_Store'
  ],
  isDevelopment      : [Env.DEVELOPMENT, Env.STAGING].includes(process.env.NODE_ENV || Env.DEVELOPMENT),
  pathDirNameDownload: 'src/gmail/download'
}

const configs: Record<string, Config> = {
  [Env.DEVELOPMENT]: {
    ...configBase,
    stage: {
      enabledMessageUnread: true,
      enabledUpload       : true
    },
    endpoint: {
      applyingApi: 'https://gtw-applying.krowdyspace.com',
      applying   : 'https://applying.krowdyspace.com'
    }
  },
  [Env.STAGING]: {
    ...configBase,
    stage: {
      enabledMessageUnread: true,
      enabledUpload       : true
    },
    endpoint: {
      applyingApi: 'https://gtw-applying.krowdy.network',
      applying   : 'https://applying.krowdy.network'
    }
  },
  [Env.PRODUCTION]: {
    ...configBase,
    stage: {
      enabledMessageUnread: true,
      enabledUpload       : true
    },
    endpoint: {
      applyingApi: 'https://gtw-applying.krowdy.com',
      applying   : 'https://applying.krowdy.com'
    }
  }
}

const stage = process.env.NODE_ENV || Env.DEVELOPMENT

export const config = configs[stage]