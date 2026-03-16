FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/package.json
RUN npm install --workspaces --include-workspace-root
COPY . .
EXPOSE 3000
CMD ["npm", "--workspace", "apps/web", "run", "start"]
