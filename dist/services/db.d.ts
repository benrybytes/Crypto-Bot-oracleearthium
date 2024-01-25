import mysql from "mysql2/promise";
declare function query(sql: any, params: any): Promise<mysql.OkPacket | mysql.RowDataPacket[] | mysql.ResultSetHeader[] | mysql.RowDataPacket[][] | mysql.OkPacket[] | mysql.ProcedureCallPacket>;
declare function createTable(): Promise<void>;
declare function createDiscordDataTable(): Promise<void>;
declare function getOffset(currentPage: any, listPerPage: any): number;
declare function emptyOrRows(rows: any): any;
export { emptyOrRows, getOffset, query, createTable, createDiscordDataTable };
