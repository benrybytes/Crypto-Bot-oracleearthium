"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `

    UPDATE bet_crypto
    SET users = (
    SELECT JSON_ARRAYAGG(
        JSON_SET(
            user,
            '$.points',
            ?
        )
    )
    FROM JSON_TABLE(users, '$[*]' COLUMNS (
        user JSON PATH '$'
    )) AS t
)
WHERE serverId = ?;

`;
