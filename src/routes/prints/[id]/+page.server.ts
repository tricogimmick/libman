import type { PageServerLoad } from './$types';
import type { PrintType } from '../../../types/print';

import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
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
    seriesName: number | null;
    description: string;   
    ndl: string;
    ownedType: string; 
}

type RelatedPersonDetailType = {
    orderNo: number;
    personId: number;
    personName: string;
    role: string;
    description: string;
};

type PrintDetailType = {
    id: number | null;
    title: string;
    originalTitle: string;
    printType: string;
    publisherName: string;
    brandName: string;
    publicationDate: string;
    seriesName: number | null;
    description: string;   
    ndl: string;
    ownedType: string; 
    relatedPersons: RelatedPersonDetailType[]
}

// 出版物を取得する
const getPrint = (db: pkg.Database, id: number) => new Promise<PrintDetailType|Error>((ok, ng) => {
    db.serialize(() => {
        db.get<QueryResultType>(
            "SELECT p.id, p.title, p.originalTitle, p.printType, c.name as publisherName, b.name as brandName, p.publicationDate, " +
            "s.title as seriesName, p.description, p.ndl, p.ownedType FROM prints as p " +
            "LEFT JOIN publishers as c ON c.id = p.publisherId " +
            "LEFT JOIN brands as b ON b.id = p.brandId " +
            "LEFT JOIN series as s ON s.id = p.seriesId WHERE p.id = ?", 
            [id], (err, row) => {
            if (err) {
                ng(err);
            } else {
                db.all<RelatedPersonDetailType>(
                    "SELECT r.orderNo, r.personId, p.name as personName, r.role, r.description " +
                    "FROM related_persons as r " +
                    "JOIN persons as p ON p.id = r.personId " +
                    "WHERE r.relatedType = 'PRINT' AND  r.relatedId = ?", [row.id], (err2, rows) => {
                        if (err2) {
                            ng(err);
                        } else {
                            const print: PrintDetailType = {
                                id: row.id,
                                title: row.title,
                                originalTitle: row.originalTitle,
                                printType: row.printType,
                                publisherName: row.publisherName,
                                brandName: row.brandName,
                                publicationDate: row.publicationDate,
                                seriesName: row.seriesName,
                                description: row.description, 
                                ndl: row.ndl,
                                ownedType: row.ownedType,                            
                                relatedPersons: rows
                            };
                            ok(print);
                        }
                    });
            }
        });    
    })
});

export const load: PageServerLoad = async ({ params }) => {
    const dbPath = env["LIBMANDB_PATH"] ?? "";
    const db = new Database(dbPath);    
    try {
		return {
			prints: await getPrint(db, Number(params.id)) as PrintDetailType
		};
    } catch (e) {
		console.log(e);
		error(500, 'Database Error');
	} finally {
        db.close();
    }
};