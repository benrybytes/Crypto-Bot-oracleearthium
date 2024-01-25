declare const _default: "\n\n    UPDATE bet_crypto\n    SET users = (\n    SELECT JSON_ARRAYAGG(\n        JSON_SET(\n            user,\n            '$.points',\n            ?\n        )\n    )\n    FROM JSON_TABLE(users, '$[*]' COLUMNS (\n        user JSON PATH '$'\n    )) AS t\n)\nWHERE serverId = ?;\n\n";
export default _default;
