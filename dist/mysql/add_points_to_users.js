"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const addPointsToUsersSQL = `
    UPDATE bet_crypto
SET users = (
    SELECT JSON_ARRAYAGG(
        JSON_SET(
            user,
            '$.points',
            JSON_UNQUOTE(JSON_EXTRACT(user, '$.points')) + ?
        )
    )
    FROM JSON_TABLE(users, '$[*]' COLUMNS (
        user JSON PATH '$'
    )) AS t
)
WHERE serverId = ?;
`;
exports.default = addPointsToUsersSQL;
