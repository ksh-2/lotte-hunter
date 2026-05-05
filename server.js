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
const REAL_COOKIE = "TS019bdbd5=01337fb4698d96812bbd3c0f7ae5fd3b930eff0e4e8f65bde23c744702c7b42bce119ac0bfe19ee41dc1a9e0ede5df9efa0ea02cea; AD_DMC=1; SameSite=None; lottecinemaSaveId=; _ga=GA1.1.2059497077.1744184471; WMONID=520NAiWEqIV; _fbp=fb.2.1753426694777.88423293787901360; bucketID=; _ga_QNX1RCJ1TW=deleted; _ga_V1QXBM747X=GS2.1.s1774104386$o30$g0$t1774104386$j60$l0$h0; ssoTkn=RDRzRjNMem1UNGMwS1M4SGxYTW5SNlhySDRLQVdyOFNxNmc5NjgxUVZXZ1hXT0Z5SGJtcVFKRHB1a0lBWkgwQg%3D%3D; referrerUrl=https%253A%252F%252Fwww.lottecinema.co.kr%252FNLCMS%252FCinemaMall%252FPopcornShopDetail_nav%253FcinemaID%253D1023%2526snckUnitID%253D10230101%2526cinemaName%253D%2525EB%25258F%252584%2525EA%2525B3%2525A1%2526displayMiddleClassification%253D01001%2526ItemID%253D10102033; baroPopcornCart=; lottecinemaCN=EZjReMBhNWFrli3%2bIaUBww%3d%3d; ASP.NET_SessionId=aw4pkymht3ohplhathd2dmw1; UID=dinosboy57%40gmail.com; USER_ID=dinosboy57%40gmail.com; INF_CLNG_YN_CHECK=Y; AGE=25; acesTkn=ci85TlozMmpObldlUDlTS05CbzJNNUdRVm9UL2FpbmYvSkM5amNIU2h0T0JUN1lmZ2diNHN4anhicnNoUVFFcA%3D%3D; rnwTkn=bFF2bkZ4bFNqZVhBQnpFNDhUcjdJaSsyeGhDVVNBSVMzN0I5cWRQR2N6ZlEraHpPK3lrblFNcUtCVHl6cWlvUGhoN1ZyclRIZXM0RU05QzhYUHZhNUE9PQ%3D%3D; cIntAkInfs=%7B%22domain%22%3A%22https%3A%2F%2Fmembers.lpoint.com%22%2C%22flwNo%22%3A%22mk3DCmXwR0%22%2C%22clntEncKey%22%3A%22910m0j0vvTbxEQKi%22%7D; l_cookie=fb03ff60-f96c-480e-9d8d-27edb0cf26a2; MemberInfo=%7b%22IsLogin%22%3a%22Y%22%2c%22MemberCode%22%3a%22dinosboy57%40gmail.com%22%2c%22MemberName%22%3a%22%ea%b6%8c%ec%84%9d%ed%98%84%22%2c%22MemberNickName%22%3a%22%22%2c%22ProfilePhoto%22%3a%22%22%2c%22MemberGubun%22%3a%220%22%2c%22LotteCinemaMemberGubun%22%3a%221%22%2c%22MemberClass%22%3a%2210%22%2c%22MemberClassName%22%3a%22%ec%9d%bc%eb%b0%98%22%2c%22AccountPoint%22%3a%220%22%2c%22Sex%22%3a%221%22%2c%22UserType%22%3anull%2c%22MemberNoOn%22%3a%22Ho%2bkIOmcrQsPeQwbn3R%2fzJO1ZBm%2bnaUk6waLmfvxO6gtRtnl7rWZV%2b2ArRZVy2XC10%2bBMogR6i356%2fitcHCkzlzcVjryoCP8P1Q6xMijTjMkAEFtjOgH9Vj8FOe%2f0L%2fZTvVybWchU0YN7KrcgKWvDn4SoXXOmcJFsgaOO%2bsfW5fCTxPZFVjKfdVsb1l7OQDG%22%2c%22MemberNoOff%22%3anull%2c%22MemberNo%22%3a%2264522929%22%2c%22CustomerNo%22%3a%221112304517%22%2c%22CustomerNoEnc%22%3a%22MqCQ9bLhR9HGRCunw%2fvcJImbuBqLJjeD3okfqELVLWRrh6FTaBzHgHjgZcjyroaqcolbehUwfycCwIvz3Dprvqt%2bzkonNYQhHmqa9evkc6U%3d%22%2c%22UserID%22%3a%22dinosboy57%40gmail.com%22%2c%22Email%22%3a%22%22%2c%22EmailCno%22%3anull%2c%22AutoLoginSetDate%22%3a%222026-05-01+%ec%98%a4%ed%9b%84+5%3a05%3a08%22%2c%22CustID%22%3a%2254628969%22%2c%22OnlCno%22%3a%22325474a4c1711e329b63fad8fc6ef556e713f353fd7054cdc1b1270231837a9d6463ce4dcad40a1fb889ebd89a1bed7691f7df6a428f00f5526ed0592771d7a1%22%2c%22LpointID%22%3a%22WPDi2JkdjxJfxDruCTzhe2YvMW6zHC2RFU3V1LOncDU%3d%22%2c%22HandPhone%22%3a%22%22%2c%22Dormant%22%3a%220%22%2c%22Password%22%3anull%2c%22ForeignerYN%22%3a%220%22%2c%22LeaveYN%22%3a%220%22%2c%22INF_CLNG_YN%22%3a%22Y%22%2c%22EncCustID%22%3a%22%22%2c%22ChatbotNoOn%22%3a%22djQMok6tDbcS4ai93r1zCA%3d%3d%22%2c%22VipTypeCd%22%3a%222%22%7d; WMEMBER_AUTH=1%7CY%7CY%7C64522929%7Cdinosboy57%40gmail.com%7C%7Cci85TlozMmpObldlUDlTS05CbzJNNUdRVm9UL2FpbmYvSkM5amNIU2h0T0JUN1lmZ2diNHN4anhicnNoUVFFcA%3D%3D%7CbFF2bkZ4bFNqZVhBQnpFNDhUcjdJaSsyeGhDVVNBSVMzN0I5cWRQR2N6ZlEraHpPK3lrblFNcUtCVHl6cWlvUGhoN1ZyclRIZXM0RU05QzhYUHZhNUE9PQ%3D%3D%7C%7B%22domain%22%3A%22https%3A%2F%2Fmembers.lpoint.com%22%2C%22flwNo%22%3A%22mk3DCmXwR0%22%2C%22clntEncKey%22%3A%22910m0j0vvTbxEQKi%22%7D; TS01570c53=01337fb4696c9ca620ac78c85301b8848d92b6e490982849aa746be2d4f7510889413073d46942056376c4755078cea7916833e8d2; _ga_QNX1RCJ1TW=GS2.1.s1777995911$o559$g0$t1777995915$j56$l0$h0";

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
