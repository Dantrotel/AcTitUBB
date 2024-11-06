# Usa Ubuntu 22.04 como imagen base
FROM ubuntu:22.04

# Establece el directorio de trabajo
WORKDIR /app

# Instala las dependencias necesarias para instalar Node.js
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs=20.12.0* && \
    rm -rf /var/lib/apt/lists/*

# Verifica que la versión instalada sea la correcta
RUN node -v && npm -v

# Copia los archivos de la app
COPY package*.json ./
COPY . .

# Instala las dependencias de la aplicación
RUN npm install

# Expone el puerto 3000 para la app
EXPOSE 3000

# Define el comando para iniciar la aplicación
CMD ["npm", "run", "dev"]
