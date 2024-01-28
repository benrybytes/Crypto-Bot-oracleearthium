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

export default addPointsToUsersSQL;