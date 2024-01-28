declare const addPointsToUsersSQL = "\n    UPDATE bet_crypto\nSET users = (\n    SELECT JSON_ARRAYAGG(\n        JSON_SET(\n            user,\n            '$.points',\n            JSON_UNQUOTE(JSON_EXTRACT(user, '$.points')) + ?\n        )\n    )\n    FROM JSON_TABLE(users, '$[*]' COLUMNS (\n        user JSON PATH '$'\n    )) AS t\n)\nWHERE serverId = ?;\n";
export default addPointsToUsersSQL;
