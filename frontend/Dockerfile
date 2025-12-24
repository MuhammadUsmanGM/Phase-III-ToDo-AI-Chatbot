# Use official Node.js runtime as base image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Create a non-root user
RUN addgroup -g 1001 -S nextjs
RUN adduser -S nextjs -u 1001

# Set proper permissions
RUN chown -R nextjs:nextjs /app
USER nextjs

# Copy the rest of the application code
COPY --chown=nextjs:nextjs . .

# Build the Next.js application
FROM base AS builder
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nextjs
RUN adduser -S nextjs -u 1001

# Copy necessary files from builder stage
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./public/_next/static

USER nextjs

EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]