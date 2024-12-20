import type { PageServerLoad } from './$types';
import type { PrintType } from '../../../types/print';

import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getRow, getAllRows } from '$lib/common';
import pkg from 'sqlite3';
const {Database} = pkg;


type QueryResultType = {
    id: number | null;
    title: string;
    originalTitle: string;
    printType: string;
    publisherName: string;
    brandName: string;
    publicationDate: string;
    issueNumber: number | null;
    seriesId: number | null;
    seriesName: string;
    description: string;   
    ownedType: string; 
}

type RelatedPersonDetailType = {
    orderNo: number;
    personId: number;
    personName: string;
    role: string;
    description: string;
};

type RelationLinkDetailType = {
    linkType: "IMG" | "LINK";
    url: string;
    alt: string;
    description: string;
};

type ContentDetailType = {
    orderNo: number;
    workId: number;
    title: string;
    subTitle: string;
    description: string;
    pageNo: number | null;
}

type PrintDetailType = {
    id: number | null;
    title: string;
    originalTitle: string;
    printType: string;
    publisherName: string;
    brandName: string;
    publicationDate: string;
    issueNumber: number | null;
    seriesId: number | null;
    seriesName: string;
    description: string;   
    ownedType: string; 
    relatedPersons: RelatedPersonDetailType[];
    relatedLinks: RelationLinkDetailType[];
    contents: ContentDetailType[];
};

// 出版物を取得する
const getPrint = (db: pkg.Database, id: number) => new Promise<PrintDetailType|Error>((ok, ng) => {
    db.serialize(async () => {
        try {
            const row = await getRow<QueryResultType>(db,
                "SELECT p.id, p.title, p.originalTitle, p.printType, c.name as publisherName, b.name as brandName, p.publicationDate, " +
                "p.issueNumber, p.seriesId, s.title as seriesName, p.description, p.ownedType FROM prints as p " +
                "LEFT JOIN publishers as c ON c.id = p.publisherId " +
                "LEFT JOIN brands as b ON b.id = p.brandId " +
                "LEFT JOIN series as s ON s.id = p.seriesId WHERE p.id = ?", 
                [id]
            );
            const relatedPersons = await getAllRows<RelatedPersonDetailType>(db,
                "SELECT r.orderNo, r.personId, p.name as personName, r.role, r.description " +
                "FROM related_persons as r " +
                "JOIN persons as p ON p.id = r.personId " +
                "WHERE r.relatedType = 'PRINT' AND  r.relatedId = ?", [row.id]
            );
            const relatedLinks = await getAllRows<RelationLinkDetailType>(db,
                "SELECT r.linkType, r.url, r.alt, r.description " +
                "FROM related_links as r " +
                "WHERE r.relatedType = 'PRINT' AND  r.relatedId = ?", [row.id]
            );
            const contents = await getAllRows<ContentDetailType>(db,
                "SELECT ct.orderNo, ct.workId, CASE WHEN ct.workId IS null THEN ct.title ELSE wk.title END as title, " +
                "ct.subTitle, ct.description, ct.pageNo FROM contents as ct " +
                "LEFT JOIN works as wk ON wk.id = ct.workId " +
                "WHERE ct.printId = ? ORDER BY ct.orderNo", [row.id]
            );
            const print: PrintDetailType = {
                id: row.id,
                title: row.title,
                originalTitle: row.originalTitle,
                printType: row.printType,
                publisherName: row.publisherName,
                brandName: row.brandName,
                publicationDate: row.publicationDate,
                issueNumber: row.issueNumber,
                seriesId: row.seriesId,
                seriesName: row.seriesName,
                description: row.description, 
                ownedType: row.ownedType,                            
                relatedPersons,
                relatedLinks,
                contents
            };
            ok(print);
        } catch (error) {
            ng(error);
        }
    });
});

export const load: PageServerLoad = async ({ params }) => {
    const dbPath = env["LIBMANDB_PATH"] ?? "";
    const db = new Database(dbPath);    
    try {
		return {
			print: await getPrint(db, Number(params.id)) as PrintDetailType
		};
    } catch (e) {
		console.log(e);
		error(500, 'Database Error');
	} finally {
        db.close();
    }
};