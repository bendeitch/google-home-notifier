FROM hausgold/node

# Create app director
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install avahi dev libs
RUN apt-get update && apt-get install -y \
  avahi-daemon avahi-discover libnss-mdns libavahi-compat-libdnssd-dev
  
# Build node_modules
RUN npm install --only=production

# Change source for address resolution
RUN sed -i s/rst\.getaddrinfo\(/rst.getaddrinfo\({families:[4]}/ ./node_modules/mdns/lib/browser.js

# Bundle app source
COPY . .

EXPOSE 8080
CMD service dbus start && service avahi-daemon start && npm start