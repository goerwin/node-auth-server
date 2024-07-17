import postgres from 'postgres';

let sqlInstance: postgres.Sql | null = null;
export function getDBInstance(databaseUrl: string) {
  if (sqlInstance) return sqlInstance;

  sqlInstance = postgres(databaseUrl);
  return sqlInstance;
}
