# Web4.Build

## What is Web4?

We believe it's all web technologies combined with AI. With our application builder, you can create both Web2 and Web3 applications using simple text commands.

No need to learn new technologies, no need to know how to code. Just describe what you want as the final outcome, and AI will handle the development.

Try our demo to create a quiz on any topic with crypto payments for donations: [https://mini.web4.build/demo](https://mini.web4.build/demo).  
The final application will be deployed and ready to work on Farcaster.

### Testnet

```shell
# install dependencies
npm ci

# copy and fill the env
cp example.env .env

# create DB
mysql -u root -p < ./migrations/testnet_db.sql

# start interactive mode for MySQL user creation:
mysql -u root

# and run commands
CREATE USER 'testnet_open_content'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON testnet_open_content.* TO 'testnet_open_content'@'localhost';
FLUSH PRIVILEGES;

exit;

# apply migrations
npx knex migrate:latest --env development

# start deployer service via PM2
pm2 start npm --name "[Testnet] Open Content API" -- run start

# OR start the server manually
npm run start
```

### Create migration

```shell
# create new migration
npx knex migrate:make my_new_migration
```

### Mainnet

```shell
# install dependencies
npm ci

# copy and fill the env
cp example.env .env

# create DB
mysql -u root -p < ./migrations/mainnet_db.sql

# start interactive mode for MySQL user creation:
mysql -u root -p

# and run commands
CREATE USER 'mainnet_open_content'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON mainnet_open_content.* TO 'mainnet_open_content'@'localhost';
FLUSH PRIVILEGES;

exit;

# apply migrations
npx knex migrate:latest --env production

# start deployer service via PM2
pm2 start npm --name "[Mainnet] Open Content API" -- run start

# OR start the server manually
npm run start
```
