/* eslint-disable sort-keys-fix/sort-keys-fix */
interface ConfigBase {
  enabledPrintConsole: boolean;
  enabledUnread: boolean;
  fileExclude: string[];
  isDevelopment: boolean;
  pathDirNameDownload: string;
  stage: {
    enabledMessageUnread: boolean;
    enabledUpload: boolean;
  };
}

interface Config extends ConfigBase {
  endpoint: {
    backendApi: string;
    frontend: string;
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
  pathDirNameDownload: 'src/gmail/download',
  stage              : {
    enabledMessageUnread: process.env.ENABLED_MESSAGE_UNREAD === 'true',
    enabledUpload       : process.env.ENABLED_UPLOAD === 'true'
  }
}

const configs: Record<string, Config> = {
  [Env.DEVELOPMENT]: {
    ...configBase,
    endpoint: {
      backendApi: '',
      frontend  : ''
    }
  },
  [Env.STAGING]: {
    ...configBase,
    endpoint: {
      backendApi: '',
      frontend  : ''
    }
  },
  [Env.PRODUCTION]: {
    ...configBase,
    stage: {
      enabledMessageUnread: true,
      enabledUpload       : true
    },
    endpoint: {
      backendApi: '',
      frontend  : ''
    }
  }
}

const stage = process.env.NODE_ENV || Env.DEVELOPMENT

export const config = configs[stage]