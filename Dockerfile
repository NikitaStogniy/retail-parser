# Используйте официальный образ Node.js
FROM node:18

# Установите рабочую директорию внутри контейнера
WORKDIR /app

# Скопируйте package.json и package-lock.json в контейнер
COPY package*.json ./

RUN apt-get update && \
    apt-get install -y \
      gconf-service \
      libasound2 \
      libatk1.0-0 \
      libc6 \
      libcairo2 \
      libcups2 \
      libdbus-1-3 \
      libexpat1 \
      libfontconfig1 \
      libgcc1 \
      libgconf-2-4 \
      libgdk-pixbuf2.0-0 \
      libglib2.0-0 \
      libgtk-3-0 \
      libnspr4 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libstdc++6 \
      libx11-6 \
      libx11-xcb1 \
      libxcb1 \
      libxcomposite1 \
      libxcursor1 \
      libxdamage1 \
      libxext6 \
      libxfixes3 \
      libxi6 \
      libxrandr2 \
      libxrender1 \
      libxss1 \
      libxtst6 \
      ca-certificates \
      fonts-liberation \
      libappindicator1 \
      libnss3 \
      lsb-release \
      xdg-utils \
      wget \
      libgbm-dev \
      && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
      && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
      && apt-get update \
      && apt-get install -y google-chrome-stable=120.0.6099.109-1 \
      && rm -rf /var/lib/apt/lists/*

RUN npm install

# Скопируйте остальные файлы проекта в контейнер
COPY . .

# Откройте порт, который будет слушать ваше приложение
EXPOSE 3000

# Команда для запуска вашего приложения
CMD ["npm", "start"]