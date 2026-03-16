FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY services/integration-worker/package.json services/integration-worker/package.json
RUN npm install --workspaces --include-workspace-root
COPY . .
EXPOSE 3003
CMD ["npm", "--workspace", "services/integration-worker", "run", "start"]
