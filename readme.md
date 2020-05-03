
# Cryptology Homework


**Features**

* Authenticating ( pbkdf2 & sha512 )
* E2E encrypted messaging between users ( ECDH-AES-256-GCM )
* Watermark images inside of text
* Challenge login ( Steps described in here https://github.com/cagataycali/cryptology-homework/pull/2#issue-412515435 )

**Installation**


*Project needs node.js runtime. Download from https://nodejs.org/en/download/*

Or browse & **run** in browser via `repl.it`

[![Run on Repl.it](https://repl.it/badge/github/cagataycali/cryptology-homework)](https://repl.it/github/cagataycali/cryptology-homework)

**Clone latest code:**

```bash
git clone git@github.com:cagataycali/cryptology-homework.git
```

**Install third party packages:**

```bash
npm install
```

**Run**

```bash
npm start
```


> Test users:

* username : password
* cagatay : s3cur3P@ss # Favorite pet name is "boncuk".
* test : s3cur3P@ss2 # Favorite color is "red".
* naive : s3cur3P@ss2 # Grandma name "eve".
* badguy : s3cur3P@ss2 # Mother's hometown is "İstanbul" (Starts with upper)


**If you don't have a user, when first login attempt you will be registered.**

**random analysis, hash checks, integrity analysis can be tested with `node test.js`**

![Usage gif](./gif.gif "Usage gif")
