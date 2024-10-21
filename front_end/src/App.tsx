import React from 'react';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';
import 'amis/lib/themes/cxd.css';
import 'amis/lib/helper.css';
import 'amis/sdk/iconfont.css';
import axios from 'axios';
import copy from 'copy-to-clipboard';
import { render as renderAmis, ToastComponent, AlertComponent } from 'amis';
import { toast } from 'amis-ui';

const env = {
  fetcher: ({ url, method, data, responseType, config, headers }: any) => {
    config = config || {};
    config.withCredentials = true;
    responseType && (config.responseType = responseType);

    if (config.cancelExecutor) {
      config.cancelToken = new (axios as any).CancelToken(config.cancelExecutor);
    }

    config.headers = headers || {};

    if (method !== 'post' && method !== 'put' && method !== 'patch') {
      if (data) {
        config.params = data;
      }
      return (axios as any)[method](url, config);
    } else if (data && data instanceof FormData) {
      config.headers = config.headers || {};
      config.headers['Content-Type'] = 'multipart/form-data';
    } else if (
      data &&
      typeof data !== 'string' &&
      !(data instanceof Blob) &&
      !(data instanceof ArrayBuffer)
    ) {
      data = JSON.stringify(data);
      config.headers = config.headers || {};
      config.headers['Content-Type'] = 'application/json';
    }

    return (axios as any)[method](url, data, config);
  },
  isCancel: (value: any) => (axios as any).isCancel(value),
  copy: (content: string) => {
    copy(content);
    toast.success('内容已复制到粘贴板');
  }
};

class AMISComponent extends React.Component<any, any> {
  render() {
    return renderAmis(
      {
        type: 'page',
        title: '短链接生成器',
        body: [
          {
            type: 'container',
            style: {
              maxWidth: '600px',
              margin: '0 auto',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              background: '#f8f9fa'
            },
            body: [
              {
                type: 'tabs',
                tabs: [
                  {
                    "title": "生成短链接",
                    "body": {
                      "type": "form",
                      "api": {
                        "method": "post",
                        "url": "http://127.0.0.1:8000/shorten",
                        "responseData": {
                          "short_url": "${short_url}"
                        }
                      },
                      "body": [
                        {
                          "type": "input-url",
                          "name": "url",
                          "label": "原始链接",
                          "required": true,
                          "placeholder": "请输入需要缩短的完整URL"
                        },
                        {
                          "type": "input-group",
                          "name": "custom_path_group",
                          "label": "自定义短链（可选）",
                          "body": [
                            {
                              "type": "static",
                              "value": "http://localhost:8000/",
                              "className": "text-muted"
                            },
                            {
                              "type": "input-text",
                              "name": "custom_path",
                              "placeholder": "字母、数字，5-20位数",
                              "validations": {
                                "matchRegexp": "^[a-zA-Z0-9]{5,20}$"
                              },
                              "validationErrors": {
                                "matchRegexp": "请输入5-20位字母或数字"
                              }
                            }
                          ]
                        },
                        {
                          "type": "submit",
                          "label": "生成短链接",
                          "level": "primary",
                          "block": true
                        },
                        {
                          "type": "divider"
                        },
                        {
                          "type": "tpl",
                          "label": "短链接",
                          "name": "${short_url}"
                        }
                      ],
                      "submitText": "生成短链接"
                    }
                  },
                  {
                    title: '解析短链接',
                    body: {
                      type: 'form',
                      api: {
                        method: 'get',
                        url: 'http://127.0.0.1:8000/expand?short_url=${short_url}',
                        responseData: {
                          long_url: '${long_url}'
                        }
                      },
                      body: [
                        {
                          type: 'input-url',
                          name: 'short_url',
                          label: '短链接',
                          required: true,
                          placeholder: '请输入需要解析的短链接'
                        },
                        {
                          type: 'submit',
                          label: '解析',
                          level: 'primary',
                          block: true
                        },
                        {
                          type: 'divider'
                        },
                        {
                          type: 'card',
                          header: {
                            title: '原始链接'
                          },
                          body: {
                            type: 'link',
                            href: '${long_url}',
                            body: '${long_url}'
                          },
                          visibleOn: '${long_url}'
                        }
                      ],
                      submitText: '解析'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {},
      env
    );
  }
}

export default function APP() {
  return (
    <>
      <ToastComponent key="toast" position={'top-right'} />
      <AlertComponent key="alert" />
      <AMISComponent />
    </>
  );
}