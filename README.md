<div align=center>  

<h1>prisma-db-diff</h1>

</div>

`prisma-db-diff` is a helper library built on top of the [Prisma](https://www.prisma.io/) CLI for auto-generating and versioning customizable database migrations (compatible with [Postgrator](https://www.npmjs.com/package/postgrator)). By default, the library auto-generates both `up` and `down migrations when you run the command.


If you already have an existing Prisma schema in your project, run the following command

```
npx prisma-db-diff
```

Optional arguments:

|       Option       | Arguments |         Default          |                                      Description                                      |
| :----------------: | :-------: | :----------------------: | :-----------------------------------------------------------------------------------: |
|     `--schema`     |           | `./prisma/schema.prisma` |                           Path to your Prisma schema file.                            |
| `--migrations-dir` |           |      `./migrations`      | Path to your migrations directory. If the folder will be created if it doesnn't exist |
|     ` --up  `      |           |                          |                         Generate only the `up` migration only                         |
|      `--down`      |           |                          |                        Generate only the `down` migration only                        |

Example usage:


```bash
npx prisma-db-diff --migrations-dir ./src/migrations
```

Generate only the `up` migration:

```bash
npx prisma-db-diff --up
```

Generate only the `down` migration:
```bash
npx prisma-db-diff --down
```