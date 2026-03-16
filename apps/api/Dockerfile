FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
RUN npm install --workspaces --include-workspace-root
COPY . .
EXPOSE 3001
CMD ["npm", "--workspace", "apps/api", "run", "start"]
