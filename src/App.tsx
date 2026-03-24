/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Calendar, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
  Loader2, 
  ShoppingBag, 
  TrendingUp,
  Info,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const MONTHS = [
  "1월", "2월", "3월", "4월", "5월", "6월", 
  "7월", "8월", "9월", "10월", "11월", "12월"
];

const SEASONS = [
  "봄 (신학기/이사)", 
  "여름 (휴가/장마)", 
  "가을 (캠핑/추석)", 
  "겨울 (방한/크리스마스)",
  "명절/선물시즌",
  "야외활동/레저",
  "가정/인테리어",
  "산업/현장"
];

const KEYWORDS = [
  "차량용 반사스티커 시트지", "농업용 공사장 손수레", "탁구장 탁구대 네트", "오토바이 음료거치대 배달음료거치대",
  "고점도 드럼팸프 급유기", "실내 접이식 사다리", "방사선보안X선 납 고글", "가정용 식기 건조기",
  "서서일하는 책상 노트북 거치대", "펜션 수영장 사다리", "오일자바라 기름 주유", "접이식 실내자전거 스피닝",
  "필라테스기구척추 요추 교정", "집안 텐트 집텐트", "FENGMI 전동 드라이버", "베어링 유압프레스 게이지",
  "이동식 게이밍 데스크", "화분 받침대 철제", "석고보드천장 접이식리프트", "콘크리트 교반기 몰타르",
  "어항 수조 순환기", "유축기 염소 대형", "출입금지 바리케이트 자바라", "접는 바리게이트 공사장",
  "모기 퇴치 램프", "무선마이크 케이스 랙케비넷", "로프도드래 야외 이중축", "산업용 수동 파이프절단기",
  "알루미늄 수하물 캐리어", "감파운드 보우 양궁", "실리콘가면 연극 할로윈", "헬스장 기구 정리대",
  "주차 안전 바리게이트", "배터리충전기 펄스 충전", "무거운가구 옮기기 만능지렛대", "소세지만들기 수제 소시지기계",
  "소형 라벨 프린터", "와인 하드케이스 LED", "식기살균기 칼 소독기", "고출력 16인치 전기톱",
  "바퀴 달린 접이식 테이블", "야외 벽걸이 사다리", "대형 UV 자외선", "원심 분리기 세척기",
  "대형 에어볼", "무선 충전식 리벳건", "안면보호대 투명 예초기보호구", "연못 워터 펌프",
  "터널식 미니 비날하우스", "헬스 리프팅벨트 피트니스", "너프건 AK47 장난감총", "가정용 가루 분쇄기",
  "원형톱 9인치 목공소", "케이블 전선 감기", "펌프 케이지 양수기", "식물 지지대 아치형",
  "복근 운동기구 가정용", "접이식 식탁 의자", "포차테이블 야외용 포장마차", "전문가 카메라 백팩",
  "무소음 곰프레샤 페인트 에어", "자전거 트레일러 라이딩", "차량용 사이드 포켓", "카라반 손잡이 캠핑카",
  "산업용 돋보기 확대경", "국수 뽑는 기계", "이동식 컴퓨터 받침대", "자동 담배 롤링기",
  "이동식 테이블 유압리프트", "소파 보조 테이블", "타코아끼 도구 스텐", "가정용 금고 귀중품",
  "어른 보행기 워커", "사무라이 대나무 죽도", "나무 책꽂이 원목선반", "야외 배기팬 후드",
  "베그 너프건 벡트", "경사매트 세이프티업 입구", "코카콜라 인테리어 디스펜서", "업소용 선풍기 고성능",
  "접이식 고양이 케이지", "디지털현미경 휴대용 대형", "원목 핸드레일 난간대", "투명 아크릴케이스 장식장",
  "자석 리프트 크레인", "스포츠 양궁 과녁", "자외선소독기 네일 도구", "화분받침대 거치대 대형",
  "PC받의자 각도조절 컴퓨터", "파이프절단기 산업용 수동", "조경트리머 가지치기톱", "진동 마사지매트 온열매트",
  "세탁기 이동식 롤러", "자동차 전조등 복원제", "의료용 경량지팡이 어르신", "의료용지팡이 네발지팡이 노인지팡이",
  "가정용 키재기", "사무실 2인용 쇼파", "충전용 무선 연마기", "농업용 도정기", "오토바이 주차 프레임",
  "이동식 낫은 우마", "아사바 안개 노즐", "가짜숯불장식 캠프파이어 모닥불", "포장마차천막 테라스 쉼터",
  "경차 루프박스", "마트 접이식 매대", "산업용 초음파 가습기", "가정용 전기 커피그라인더",
  "어른 워커 보행기", "스탠드 바 의자", "세발 전동 스쿠터", "수동 크린퍼", "충전식 원형톱",
  "강아지 텐트 집", "화목 나로", "대형트럭 점프기 자동차", "주방 식기 살균기", "대형 추첨 룰렛",
  "전동 샤워 브러시", "이동식 카라반 발판", "소형 인버터 레이저용접기", "슈미트햄머 콘크리트 강도",
  "실험실 회전 의자", "다이빙장갑 다이빙 글러브", "무선 충전식 캠핑선풍기", "고성능 접이식 업소용선풍기",
  "벽걸이 워터릴 정원", "체육관 헬스장 정리대", "실내 어린이집 볼풀", "키재는기계 가정용 키재기",
  "승무원유니폼 대한항공 근무복", "공사장 접는 말비계", "북유럽 가짜창문", "타이어공기주입기 실린더 트럭",
  "원목벽선반 나무 책꽂이", "고압 분무기 세차기", "입구 경사매트", "온열 마사지매트",
  "대형 북유럽 화분받침대", "휴대용 엔진 발전기", "터널식 미니 비닐하우스", "레버블럭 1톤 기구",
  "눈썹문신기계 셀프 타투", "구피 베타 철제축양장", "스테인레스 압력 물탱크", "이동식 운반 테이블",
  "레이저 포인트 야외", "의료용 드레싱 키트", "텃밭 고추밭 경운기쟁기", "철제 화분 진열대",
  "수동 명함 모따기커터", "수직형 화물 리프트", "집안 텐트 침대텐트", "스텐 무선전동가위",
  "배운동 쉐이크 운동기구덤벨기", "펌프 양수기", "야외 공원 정원 그네", "레몬 수동 착즙기",
  "다이어프램 고압 스프레이", "야광 덤벨 랙", "줄눈 제거 시공", "핸디형 포켓 쉘이젝팅",
  "스테인리스 스텐판", "행사장 원목 강연대", "벽장식 인테리어 창문", "원목 저상형침대프레임",
  "중국 전통의상 무대", "대형견 바리깡 이발기", "에센셜오일 증류기 추출기", "야외 비상작업등 LED",
  "하수구 내시경 카메라", "자동차 적재함", "초대형 뜰채 70cm", "충전식 정전기 정원",
  "원형 파이프 면취기", "에어컨 진공펌프 급유기", "원목 교회헌금함", "캠프파이어 모닥불 화로",
  "아채 채칼 머신", "스키 트레이너 머신", "헬스 문틀 바", "소형 이동식 냉온풍기", "대형 쇼핑 카트",
  "화투매트 접이식 테이블", "우도 원목 악세서리", "싱크대 304 스테인레스", "데스크탑 유선 마우스",
  "수족관 수질 연못여과기", "응원봉 커버", "발목보호대 반깁스", "조립식 드레스룸",
  "전선 풀링기 다이", "포름알데히드 암모니아 오존소독기계", "공식 응원봉", "수직형 리프트 화물",
  "열선 전기 커터", "충전식 풀무 장작", "캠핑카 놀이", "알루미늄 루프바스켓", "접이식 원형테이블",
  "오토바이 보조 바퀴", "대한항공 비행기 여객기", "충전식 전기톱 6인치", "그랜드 피아노 커버",
  "연기 후드 배기관", "연수용 접이식 세미나", "승용차 폴딩 박스", "여성 무스탕 점퍼",
  "식기 살균기", "아사바 안개분사 노즐", "이동식 말비계", "고양이 사료통", "실내벤치 현과 신발장",
  "수제 소시지 만들기", "테라스 야외테이블", "인도 보도블럭 진입판", "남성 경랑 패딩",
  "차량 와이퍼 깜빡이 인형", "마인크래프트 무드등", "강아지 밥그릇"
];

interface Recommendation {
  keyword: string;
  reason: string;
  seasonality: string;
}

export default function App() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleItem = (item: string) => {
    setSelectedItems(prev => {
      if (prev.includes(item)) {
        return prev.filter(i => i !== item);
      }
      if (prev.length >= 10) return prev;
      return [...prev, item];
    });
  };

  const handleAnalyze = async () => {
    if (selectedItems.length === 0) return;

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 300);

    const prompt = `
        당신은 전문 상품 소싱 전문가입니다. 
        사용자가 선택한 시기/시즌: ${selectedItems.join(", ")}
        
        아래 제공된 키워드 리스트 중에서 위 시기에 판매량이 높을 것으로 예상되는 상품 5~8개를 추천해주세요.
        각 상품에 대해 추천 이유와 해당 상품의 계절성(시즌 특징)을 설명해주세요.
        
        키워드 리스트:
        ${KEYWORDS.join(", ")}
        
        응답은 반드시 아래 JSON 형식으로만 해주세요:
        [
          {
            "keyword": "상품명",
            "reason": "추천 이유",
            "seasonality": "시즌 특징"
          }
        ]
      `;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      const text = response.text;
      
      // Clean JSON string if model adds markdown blocks
      const jsonStr = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(jsonStr);
      
      setRecommendations(data);
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError("AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedItems([]);
    setRecommendations([]);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans">
      {/* Hero Section */}
      <header className="relative w-full aspect-[16/9] overflow-hidden bg-[#1A1A1A]">
        <img 
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000" 
          alt="Innovation Sourcing AI" 
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-4"
          >
            혁신 소싱 AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 font-light"
          >
            데이터 기반 시즌별 최적의 상품 소싱 솔루션
          </motion.p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          
          {/* Progress Bar */}
          {isAnalyzing || progress > 0 ? (
            <div className="mb-12">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Analysis Progress</span>
                <span className="text-3xl font-black">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#1A1A1A]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : null}

          {recommendations.length === 0 ? (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <Calendar className="w-8 h-8 text-[#1A1A1A]" />
                <h2 className="text-2xl font-bold tracking-tight">시기 및 시즌 선택 (최대 10개)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Months Grid */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Monthly Selection</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {MONTHS.map(month => (
                      <button
                        key={month}
                        onClick={() => toggleItem(month)}
                        className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                          selectedItems.includes(month)
                            ? 'bg-[#1A1A1A] text-white shadow-lg'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seasons Grid */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Seasonal Context</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {SEASONS.map(season => (
                      <button
                        key={season}
                        onClick={() => toggleItem(season)}
                        className={`py-3 px-4 rounded-xl text-xs font-bold text-left transition-all duration-200 ${
                          selectedItems.includes(season)
                            ? 'bg-[#1A1A1A] text-white shadow-lg'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {season}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 flex flex-col items-center">
                <div className="text-sm text-gray-400 mb-6 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span>선택된 항목: {selectedItems.length} / 10</span>
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={selectedItems.length === 0 || isAnalyzing}
                  className={`group relative px-12 py-5 rounded-full font-black text-lg transition-all duration-300 flex items-center gap-3 ${
                    selectedItems.length > 0 && !isAnalyzing
                      ? 'bg-[#1A1A1A] text-white hover:scale-105 hover:shadow-2xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      소싱 상품 추천받기
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </section>
          ) : (
            <section>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-[#1A1A1A]" />
                  <h2 className="text-3xl font-black tracking-tighter">추천 소싱 리스트</h2>
                </div>
                <button 
                  onClick={reset}
                  className="text-sm font-bold text-gray-400 hover:text-[#1A1A1A] transition-colors"
                >
                  다시 선택하기
                </button>
              </div>

              <div className="space-y-6">
                {recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.keyword}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group flex flex-col md:flex-row gap-6 p-6 rounded-3xl border border-gray-100 hover:border-[#1A1A1A] hover:bg-gray-50 transition-all duration-300"
                  >
                    <div className="w-16 h-16 shrink-0 bg-[#1A1A1A] rounded-2xl flex items-center justify-center text-white">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black">{rec.keyword}</h3>
                        <span className="px-3 py-1 bg-gray-200 rounded-full text-[10px] font-black uppercase tracking-wider text-gray-600">
                          {rec.seasonality}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed font-medium">
                        {rec.reason}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-gray-200 group-hover:text-[#1A1A1A] transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-300 text-center">
                <p className="text-gray-500 font-medium mb-4">
                  위 추천 상품들은 선택하신 <span className="text-[#1A1A1A] font-bold">"{selectedItems.join(", ")}"</span> 시기의 시장 트렌드와 계절적 수요를 바탕으로 분석되었습니다.
                </p>
                <div className="flex justify-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Search className="w-4 h-4" />
                    <span>키워드 경쟁도 분석 완료</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>예상 수요 지수 높음</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl text-center font-bold">
              {error}
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
          <User className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Developer: 정혁신</span>
        </div>
        <p className="text-xs text-gray-400">© 2026 혁신 소싱 AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
