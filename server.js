/* server.js - 앱 전용 헤더 및 쿠키 적용 버전 */
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// [중요] 피들러로 낚은 본인의 쿠키 전체를 여기에 붙여넣으세요.
const REAL_COOKIE = "TS019bdbd5=01337fb4698d96812bbd3c0f7ae5fd3b930eff0e4e8f65bde23c744702c7b42bce119ac0bfe19ee41dc1a9e0ede5df9efa0ea02cea";

// 앱 전용 공통 헤더
const APP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-G986N Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/147.0.7727.111 Mobile Safari/537.36 /GA_Android LotteCinemaApp_Android",
    "x-requested-with": "kr.co.lottecinema.lcm",
    "Origin": "https://www.lottecinema.co.kr",
    "Cookie": REAL_COOKIE,
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7"
};

const TARGET_KEYWORDS = ["포스터", "특전", "아트카드", "현장", "시그니처", "무비", "증정", "T.T", "아카데미", "Signature", "프로젝트"];

async function fetchEventList() {
    const paramList = {
        MethodName: "GetEventLists",
        channelType: "HO",
        osType: "Android", // W에서 Android로 변경
        osVersion: "13",
        EventClassificationCode: "20",
        SearchText: "", 
        CinemaID: "",
        PageNo: 1,
        PageSize: 50, 
        MemberNo: "0",
    };

    const formData = new FormData();
    formData.append("paramList", JSON.stringify(paramList));

    try {
        const res = await fetch("https://www.lottecinema.co.kr/LCWS/Event/EventData.aspx", {
            method: "POST",
            body: formData,
            headers: {
                ...formData.getHeaders(),
                ...APP_HEADERS,
                Referer: "https://www.lottecinema.co.kr/NLCHS/Event/DetailList?code=20"
            }
        });
        const data = await res.json();
        if (!data.Items) return [];
        
        return data.Items.filter(item => 
            TARGET_KEYWORDS.some(keyword => item.EventName.includes(keyword))
        );
    } catch (e) {
        console.error("목록 조회 실패:", e);
        return [];
    }
}

app.post('/api/scan', async (req, res) => {
    const { baseGiftID, range } = req.body;
    console.log(`📡 스캔 요청 시작: BaseID ${baseGiftID}, Range ${range}`);
    
    try {
        // 1. 이벤트 목록을 가져올 때 키워드 필터링을 최소화하여 
        // '프로젝트 헤일메리' 같은 항목이 누락되지 않게 합니다.
        const events = await fetchEventList(); 
        const results = [];

        // 2. 모든 이벤트에 대해 루프를 돌며 GiftID 범위를 뒤집니다.
        for (const event of events) {
            const promises = [];
            const r = parseInt(range);
            const b = parseInt(baseGiftID);

            for (let i = -r; i <= r; i++) {
                const testGiftID = (b + i).toString();
                const paramList = {
                    MethodName: "GetCinemaGoods",
                    channelType: "HO",
                    osType: "Android",
                    osVersion: "13",
                    EventID: event.EventID.toString(),
                    GiftID: testGiftID
                };
                
                const formData = new FormData();
                formData.append("paramList", JSON.stringify(paramList));

                const reqPromise = fetch("https://www.lottecinema.co.kr/LCWS/Event/EventData.aspx", {
                    method: "POST",
                    body: formData,
                    headers: {
                        ...formData.getHeaders(),
                        ...APP_HEADERS, // 아까 정의한 앱 헤더와 쿠키가 여기서 박힙니다.
                        Referer: `https://www.lottecinema.co.kr/NLCHS/Event/EventTemplateInfo?eventId=${event.EventID}`
                    }
                })
                .then(r => r.json())
                .then(d => {
                    // [수정 핵심] Cnt가 0인 지점들도 일단 데이터가 오면 '성공'으로 간주하여 
                    // 목록에 띄우도록 조건을 변경하거나, d.CinemaDivisionGoods가 존재하는지만 체크합니다.
                    if (d.CinemaDivisionGoods && d.CinemaDivisionGoods.length > 0) {
                        return { giftID: testGiftID, stock: d.CinemaDivisionGoods };
                    }
                    return null;
                })
                .catch(() => null);

                promises.push(reqPromise);
            }

            const eventResults = await Promise.all(promises);
            
            // 해당 이벤트에서 유효한 GiftID 결과들을 모두 수집합니다.
            eventResults.forEach(hit => {
                if (hit) {
                    results.push({
                        eventName: event.EventName,
                        eventID: event.EventID,
                        foundGiftID: hit.giftID,
                        stockData: hit.stock,
                    });
                }
            });
        }

        res.json({
            success: true,
            scannedEventCount: events.length,
            results: results // 발견된 모든 특전 리스트 반환
        });
    } catch (error) {
        console.error("스캔 중 오류:", error);
        res.status(500).json({ success: false, message: "서버 내부 오류" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 앱 버전 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
