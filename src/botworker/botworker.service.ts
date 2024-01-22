import { Injectable } from '@nestjs/common';
import { ParserService } from 'src/parser/parser.service';
import { SequelizeService } from 'src/sequelize/sequelize.service';
import * as cron from 'node-cron';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

@Injectable()
export class BotworkerService {
  private bot1: Telegraf;
  private bot2: Telegraf;
  private bot3: Telegraf;
  private bot4: Telegraf;

  constructor(
    private readonly sequelizeService: SequelizeService,
    private readonly parserService: ParserService,
  ) {
    const isProd = process.env.isProd;
    this.bot1 = new Telegraf(
      isProd ? process.env.PROD_BOT_TOKEN1 : process.env.DEV_BOT_TOKEN1,
    );
    this.bot2 = new Telegraf(
      isProd ? process.env.PROD_BOT_TOKEN2 : process.env.DEV_BOT_TOKEN2,
    );
    this.bot3 = new Telegraf(
      isProd ? process.env.PROD_BOT_TOKEN3 : process.env.DEV_BOT_TOKEN3,
    );
    this.bot4 = new Telegraf(
      isProd ? process.env.PROD_BOT_TOKEN4 : process.env.DEV_BOT_TOKEN4,
    );

    this.bot1.start((ctx) => this.start(ctx));
    this.bot2.start((ctx) => this.start(ctx));
    this.bot3.start((ctx) => this.start(ctx));
    this.bot4.start((ctx) => this.start(ctx));

    this.bot1.command('check', (ctx) => this.generateMessage());
    this.bot1.command('cian', (ctx) => this.checkCian());
    this.bot1.command('count', (ctx) => this.getCount(ctx));
    this.bot1.command('drop', (ctx) => this.droppDB(ctx));
    this.bot1.on(message('text'), (ctx) => this.parse(ctx));

    this.bot2.command('check', (ctx) => this.generateMessage());
    this.bot2.command('cian', (ctx) => this.checkCian());
    this.bot2.command('count', (ctx) => this.getCount(ctx));
    this.bot2.command('drop', (ctx) => this.droppDB(ctx));
    this.bot2.on(message('text'), (ctx) => this.parse(ctx));

    this.bot3.command('check', (ctx) => this.generateMessage());
    this.bot3.command('cian', (ctx) => this.checkCian());
    this.bot3.command('count', (ctx) => this.getCount(ctx));
    this.bot3.command('drop', (ctx) => this.droppDB(ctx));
    this.bot3.on(message('text'), (ctx) => this.parse(ctx));

    this.bot4.command('check', (ctx) => this.generateMessage());
    this.bot4.command('cian', (ctx) => this.checkCian());
    this.bot4.command('count', (ctx) => this.getCount(ctx));
    this.bot4.command('drop', (ctx) => this.droppDB(ctx));
    this.bot4.on(message('text'), (ctx) => this.parse(ctx));

    // this.bot5.command('check', (ctx) => this.generateMessage());
    // this.bot5.command('cian', (ctx) => this.checkCian());
    // this.bot5.command('count', (ctx) => this.getCount(ctx));
    // this.bot5.command('clusters', (ctx) => this.countClusters(ctx));
    // this.bot5.command('flatclusters', (ctx) => this.countFlatsInClusters(ctx));
    // this.bot5.on(message('text'), (ctx) => this.parse(ctx));

    this.bot1.launch();
    this.bot2.launch();
    this.bot3.launch();
    this.bot4.launch();
    // this.bot5.launch();
    this.scheduleCianCheck();
  }

  scheduleCianCheck() {
    cron.schedule('0 * * * *', () => {
      this.generateMessage();
    });
  }
  async parse(ctx) {
    const messageText = ctx.message.text;
    const cianLinkPattern = /cian/;
    if (cianLinkPattern.test(messageText) && messageText.length < 1) {
      ctx.reply('Пошел процесс...');
      this.parserService.scrapeList(messageText, 10);
    } else {
      ctx.reply('Не пошел процесс, проверь ссылку');
    }
    // this.parserService.scrapeList(ctx.message.text, 100),
  }
  async start(ctx) {
    ctx.reply(process.env.HELLOMESSAGE || 'Привет');
    this.sequelizeService.saveUser(ctx.message.from.id);
  }

  async droppDB(ctx) {
    await this.sequelizeService.dropDB();
    await ctx.reply('База данных удалена');
  }

  async countClusters(ctx) {
    const count = 'Кластерs: ' + (await this.sequelizeService.countClusters());
    await ctx.reply(count);
  }

  async countFlatsInClusters(ctx) {
    const count =
      'Объектов внутри clusters: ' +
      (await this.sequelizeService.countFlatsInClusters());
    await ctx.reply(count);
  }

  async getCount(ctx) {
    const count =
      'Колличество квартир: ' + (await this.sequelizeService.getCount());
    await ctx.reply(count);
  }

  async checkCian() {
    // const url =
    //   'https://spb.cian.ru/cat.php?deal_type=sale&engine_version=2&flat_share=2&is_by_homeowner=1&object_type%5B0%5D=1&offer_type=flat&region=2&room1=1&room2=1&room3=1&room4=1&room5=1&room6=1&sort=creation_date_desc';
    const limit = 2000;
    const url =
      'https://spb.cian.ru/cat.php?deal_type=sale&engine_version=2&flat_share=2&is_by_homeowner=1&object_type%5B0%5D=1&offer_type=flat&region=2&room1=1&room2=1&room3=1&sort=creation_date_desc';
    this.parserService.scrapeList(url, limit);
  }

  async generateMessage() {
    this.sequelizeService.findBestProperty().then(async (results) => {
      const users = await this.sequelizeService.getUsers();
      const id = users.filter((user) => user.uid).map((user) => user.uid);
      if (results[0]) {
        const isUnpublish = await this.parserService.scrapeUnpublished(
          results[0]['1stProp'],
        );
        if (!isUnpublish) {
          this.sendMessage1(id, results[0]);
        }
      }
      if (results[1]) {
        const isUnpublish = await this.parserService.scrapeUnpublished(
          results[1]['1stProp'],
        );
        if (!isUnpublish) {
          this.sendMessage2(id, results[1]);
        }
      }

      if (results[2]) {
        const isUnpublish = await this.parserService.scrapeUnpublished(
          results[2]['1stProp'],
        );

        if (!isUnpublish) {
          this.sendMessage3(id, results[2]);
        }
      }

      if (results[3]) {
        const isUnpublish = await this.parserService.scrapeUnpublished(
          results[3]['1stProp'],
        );

        if (!isUnpublish) {
          this.sendMessage4(id, results[3]);
        }
      }
    });
  }

  async sendMessage1(users: string[], message: string) {
    const messageText = `С чего начали - ${message['1stProp']},
    Лучшая в кластере - ${message['minPriceProp']},
    Средняя цена - ${message['medianPrice']}
    Средняя в кластере - ${message['medianProp']}
    Скидка от средней - ${message['discount']}%
  
    `;
    users.forEach((user) => {
      this.bot1.telegram.sendMessage(parseInt(user), messageText).catch((e) => {
        // Обработка ошибки
        console.log(e);
      });
    });
  }

  async sendMessage2(users: string[], message: string) {
    const messageText = `С чего начали - ${message['1stProp']},
    Лучшая в кластере - ${message['minPriceProp']},
    Средняя цена - ${message['medianPrice']}
    Средняя в кластере - ${message['medianProp']}
    Скидка от средней - ${message['discount']}%
    `;
    users.forEach((user) => {
      this.bot2.telegram.sendMessage(parseInt(user), messageText).catch((e) => {
        // Обработка ошибки
        console.log(e);
      });
    });
  }

  async sendMessage3(users: string[], message: string) {
    const messageText = `С чего начали - ${message['1stProp']},
    Лучшая в кластере - ${message['minPriceProp']},
    Средняя цена - ${message['medianPrice']}
    Средняя в кластере - ${message['medianProp']}
    Скидка от средней - ${message['discount']}%
    `;
    users.forEach((user) => {
      this.bot3.telegram.sendMessage(parseInt(user), messageText).catch((e) => {
        // Обработка ошибки
        console.log(e);
      });
    });
  }

  async sendMessage4(users: string[], message: string) {
    const messageText = `С чего начали - ${message['1stProp']},
    Лучшая в кластере - ${message['minPriceProp']},
    Средняя цена - ${message['medianPrice']}
    Средняя в кластере - ${message['medianProp']}
    Скидка от средней - ${message['discount']}%
    Продажа: ${message['salePrice'] ? message['salePrice'].toFixed(2) : 'н/д'}
    Покупка: ${message['buyoutPrice'] ? message['buyoutPrice'].toFixed(2) : 'н/д'}
    Процент торга: ${message['tradePercent'] ? message['tradePercent'].toFixed(2) : 'н/д'}%
    `;
    users.forEach((user) => {
      this.bot4.telegram.sendMessage(parseInt(user), messageText).catch((e) => {
        // Обработка ошибки
        console.log(e);
      });
    });
  }
}
