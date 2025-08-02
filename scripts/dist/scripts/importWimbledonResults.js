"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../src/lib/prisma");
const jsdom_1 = require("jsdom");
// Use native fetch (Node 18+)
// If using Node <18, install 'undici' and use globalThis.fetch = require('undici').fetch;
// import fetch from 'node-fetch';
// import type { JSDOM } from 'jsdom';
// Helper to parse set scores and determine points
function getPoints(gender, setsWon, setsLost, winner) {
    if (gender === 'male') {
        if (winner) {
            if (setsWon === 3 && setsLost === 0)
                return 5;
            if (setsWon === 3 && setsLost === 1)
                return 4;
            if (setsWon === 3 && setsLost === 2)
                return 3;
        }
        else {
            if (setsWon === 2 && setsLost === 3)
                return 2;
            if (setsWon === 1 && setsLost === 3)
                return 1;
            if (setsWon === 0 && setsLost === 3)
                return 0;
        }
    }
    else {
        if (winner) {
            if (setsWon === 2 && setsLost === 0)
                return 5;
            if (setsWon === 2 && setsLost === 1)
                return 3;
        }
        else {
            if (setsWon === 1 && setsLost === 2)
                return 1;
            if (setsWon === 0 && setsLost === 2)
                return 0;
        }
    }
    return 0;
}
function importResults(day) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const url = `https://www.wimbledon.com/en_GB/scores/results/day${day}.html`;
        const res = yield fetch(url);
        const html = yield res.text();
        const dom = new jsdom_1.JSDOM(html);
        const doc = dom.window.document;
        // This selector may need adjustment based on Wimbledon HTML structure
        const matches = doc.querySelectorAll('.scores-table tbody tr');
        for (const match of matches) {
            const cells = match.querySelectorAll('td');
            if (cells.length < 6)
                continue;
            const playerName = ((_a = cells[1].textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
            const opponentName = ((_b = cells[2].textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
            const scoreStr = ((_c = cells[3].textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '';
            const roundStr = ((_d = cells[0].textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
            const gender = roundStr.toLowerCase().includes('women') ? 'female' : 'male';
            // Parse set scores
            const sets = scoreStr.split(',').map((s) => s.trim());
            let setsWon = 0, setsLost = 0;
            sets.forEach((set) => {
                const [p1, p2] = set.split('-').map(Number);
                if (p1 > p2)
                    setsWon++;
                else
                    setsLost++;
            });
            // Determine winner
            const winner = setsWon > setsLost;
            const points = getPoints(gender, setsWon, setsLost, winner);
            // Find player in DB
            const player = yield prisma_1.default.player.findFirst({ where: { name: playerName } });
            if (!player)
                continue;
            // Save result
            yield prisma_1.default.matchResult.create({
                data: {
                    playerId: player.id,
                    round: day,
                    score: scoreStr,
                    points,
                },
            });
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    for (let day = 8; day <= 14; day++) {
        yield importResults(day);
        console.log(`Imported results for day ${day}`);
    }
}))();
