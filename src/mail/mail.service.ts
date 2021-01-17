import got from 'got';
import * as FormData from 'form-data';

import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(@Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions) {}

  private async sendEmail(subject: string, template: string, emailVars: EmailVar[]) {
    const form = new FormData();
    form.append('from', `Jalaj from Urgent Team <mailgun@${this.options.domain}>`);
    form.append('to', 'intrenc@congmart.live');
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));

    try {
      await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        method: 'POST',
        headers: {
          // conversion to base64 is necessary for Basic Authorization
          Authorization: `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString(
            'base64',
          )}`,
        },
        body: form,
      });
    } catch (error) {
      console.log(error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'verify-email', [
      { key: 'username', value: email },
      { key: 'code', value: code },
      { key: 'redirect_url', value: 'http://localhost:3001' },
    ]);
  }
}
