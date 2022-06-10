FROM node:14
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
CMD ["npm", "start"]
EXPOSE 3001