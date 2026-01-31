/* server.js - 백엔드 서버 */
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors()); // 프론트엔드에서 요청 허용
app.use(express.json()); // JSON 데이터 받기
app.use(express.static("public")); // 'public' 폴더의 HTML 파일 보여주기

// 검색 키워드 (서버에서 관리하거나 프론트에서 받을 수도 있음)
const TARGET_KEYWORDS = [
  "포스터",
  "특전",
  "아트카드",
  "현장",
  "시그니처",
  "무비",
  "증정",
  "T.T",
];

// 1. 이벤트 목록 가져오기 함수
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
    const res = await fetch(
      "https://www.lottecinema.co.kr/LCWS/Event/EventData.aspx",
      {
        method: "POST",
        body: formData,
        headers: {
          ...formData.getHeaders(),
          Referer:
            "https://www.lottecinema.co.kr/NLCHS/Event/DetailList?code=20",
          Origin: "https://www.lottecinema.co.kr",
          "User-Agent": "Mozilla/5.0",
          Host: "www.lottecinema.co.kr",
        },
      },
    );
    const data = await res.json();
    if (!data.Items) return [];

    // 키워드 필터링
    return data.Items.filter((item) =>
      TARGET_KEYWORDS.some((keyword) => item.EventName.includes(keyword)),
    );
  } catch (e) {
    console.error("목록 조회 실패:", e);
    return [];
  }
}

// 2. 수량 조회 (Brute Force) API 엔드포인트
app.post("/api/scan", async (req, res) => {
  // 프론트엔드에서 보낸 설정값 받기
  const { baseGiftID, range } = req.body;

  console.log(`📡 스캔 요청 도착! BaseID: ${baseGiftID}, Range: ${range}`);

  const events = await fetchEventList();
  const results = [];

  // 병렬 처리를 위한 전체 작업 목록
  // 주의: 너무 많은 요청은 서버 부하를 줄 수 있으니 적절히 조절 필요
  for (const event of events) {
    let foundStock = null;
    const promises = [];

    // 범위 탐색
    for (let i = -range; i <= range; i++) {
      const testGiftID = (parseInt(baseGiftID) + i).toString();

      const paramList = {
        MethodName: "GetCinemaGoods",
        channelType: "HO",
        osType: "W",
        osVersion: "Mozilla/5.0",
        EventID: event.EventID.toString(),
        GiftID: testGiftID,
      };

      const formData = new FormData();
      formData.append("paramList", JSON.stringify(paramList));

      const reqPromise = fetch(
        "https://www.lottecinema.co.kr/LCWS/Event/EventData.aspx",
        {
          method: "POST",
          body: formData,
          headers: {
            ...formData.getHeaders(),
            Referer: `https://www.lottecinema.co.kr/NLCHS/Event/EventTemplateInfo?eventId=${event.EventID}`,
            "User-Agent": "Mozilla/5.0",
          },
        },
      )
        .then((r) => r.json())
        .then((d) => {
          if (d.CinemaDivisionGoods && d.CinemaDivisionGoods.length > 0) {
            return { giftID: testGiftID, stock: d.CinemaDivisionGoods };
          }
          return null;
        })
        .catch(() => null);

      promises.push(reqPromise);
    }

    // 해당 이벤트에 대해 모든 GiftID 찌르기 완료 대기
    const eventResults = await Promise.all(promises);
    const hit = eventResults.find((r) => r !== null);

    if (hit) {
      results.push({
        eventName: event.EventName,
        eventID: event.EventID,
        foundGiftID: hit.giftID,
        stockData: hit.stock.filter((cinema) => cinema.Cnt > 0), // 재고 있는 곳만
      });
    }
  }

  // 결과 전송
  res.json({
    success: true,
    scannedEventCount: events.length,
    results: results,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
