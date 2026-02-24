/* server.js - 경로 문제 해결 버전 */
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');
const path = require('path'); // [추가] 경로를 확실하게 찾아주는 도구

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// [핵심 수정] __dirname을 사용하여 'public' 폴더의 절대 경로를 지정
// 이렇게 해야 리눅스 서버에서도 index.html을 정확히 찾습니다.
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// 루트 접속 시 index.html 강제 연결
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

const TARGET_KEYWORDS = ["포스터", "특전", "아트카드", "현장", "시그니처", "무비", "증정", "T.T", "아카데미"];

async function fetchEventList() {
    const paramList = {
        MethodName: "GetEventLists",
        channelType: "HO",
        osType: "W",
        osVersion: "Mozilla/5.0",
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
                Referer: "https://www.lottecinema.co.kr/NLCHS/Event/DetailList?code=20",
                Origin: "https://www.lottecinema.co.kr",
                "User-Agent": "Mozilla/5.0",
                Host: "www.lottecinema.co.kr",
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
    console.log(`📡 스캔 요청: BaseID ${baseGiftID}, Range ${range}`);
    
    try {
        const events = await fetchEventList();
        const results = [];

        for (const event of events) {
            const promises = [];
            for (let i = -range; i <= range; i++) {
                const testGiftID = (parseInt(baseGiftID) + i).toString();
                const paramList = {
                    MethodName: "GetCinemaGoods",
                    channelType: "HO",
                    osType: "W",
                    osVersion: "Mozilla/5.0",
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
                        Referer: `https://www.lottecinema.co.kr/NLCHS/Event/EventTemplateInfo?eventId=${event.EventID}`,
                        "User-Agent": "Mozilla/5.0",
                    }
                })
                .then(r => r.json())
                .then(d => {
                    if (d.CinemaDivisionGoods && d.CinemaDivisionGoods.length > 0) {
                        return { giftID: testGiftID, stock: d.CinemaDivisionGoods };
                    }
                    return null;
                })
                .catch(() => null);

                promises.push(reqPromise);
            }

            const eventResults = await Promise.all(promises);
            const hit = eventResults.find(r => r !== null);

            if (hit) {
                results.push({
                    eventName: event.EventName,
                    eventID: event.EventID,
                    foundGiftID: hit.giftID,
                    stockData: hit.stock,
                });
            }
        }

        res.json({
            success: true,
            scannedEventCount: events.length,
            results: results
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "서버 내부 오류" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
});


