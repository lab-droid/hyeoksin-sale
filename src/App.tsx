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
  User,
  LayoutDashboard,
  HelpCircle,
  Settings,
  Dices,
  Mail,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini
const getGenAI = (apiKey: string) => new GoogleGenAI({ apiKey });

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
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recommendationCount, setRecommendationCount] = useState(5);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  
  // API Key State
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('GEMINI_USER_API_KEY') || process.env.GEMINI_API_KEY || "";
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const isKeySet = useMemo(() => apiKey.length > 10, [apiKey]);

  const saveApiKey = () => {
    localStorage.setItem('GEMINI_USER_API_KEY', tempKey);
    setApiKey(tempKey);
    setShowKeyInput(false);
  };

  const toggleMonth = (month: string) => {
    setSelectedMonth(prev => prev === month ? null : month);
  };

  const toggleSeason = (season: string) => {
    setSelectedSeason(prev => prev === season ? null : season);
  };

  const handleAnalyze = async (countOverride?: number) => {
    const count = countOverride || recommendationCount;
    if (!selectedMonth && !selectedSeason) return;
    if (!isKeySet) {
      setError("API 키가 설정되지 않았습니다. 우측 상단에서 키를 입력해주세요.");
      setShowKeyInput(true);
      return;
    }

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
        당신은 대한민국 이커머스 전문 상품 소싱 전문가입니다. 
        사용자가 선택한 시기: ${selectedMonth || '지정하지 않음'}
        사용자가 선택한 시즌: ${selectedSeason || '지정하지 않음'}
        
        Google Gemini 딥 리서치 기능을 활용하여, 대한민국의 100만 개 이상의 상품 데이터 중에서 위 조건에 판매량이 급증할 것으로 예상되는 최적화된 상품 딱 ${count}개를 추천해주세요.
        
        [참고용 소싱 키워드 형식]
        차량용 반사스티커 시트지, 농업용 공사장 손수레, 탁구장 탁구대 네트, 오토바이 음료거치대 배달음료거치대, 고점도 드럼팸프 급유기
        (위와 같이 구체적이고 세분화된 형태의 키워드로 추천해주세요. 단, 위 예시에 얽매이지 말고 실제 시장 트렌드에 맞는 새로운 상품을 자유롭게 발굴하세요.)
        
        응답은 반드시 아래 JSON 형식으로만 해주세요:
        [
          {
            "keyword": "상품명 (구체적인 키워드 형태)",
            "reason": "추천 이유 (데이터 및 트렌드 기반)",
            "seasonality": "시즌 특징 및 적합성"
          }
        ]
      `;

    try {
      const ai = getGenAI(apiKey);
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      
      const text = response.text;
      
      // Clean JSON string if model adds markdown blocks
      const jsonStr = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(jsonStr);
      
      setRecommendations(data);
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError("AI 분석 중 오류가 발생했습니다. API 키가 유효한지 확인해주세요.");
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedMonth(null);
    setSelectedSeason(null);
    setRecommendations([]);
    setProgress(0);
    setError(null);
    setRecommendationCount(5);
  };

  const handleRandomAnalyze = () => {
    if (!selectedMonth && !selectedSeason) {
      setError("먼저 시기 또는 시즌을 최소 1개 이상 선택해주세요.");
      return;
    }
    const random = Math.floor(Math.random() * 10) + 1;
    setRecommendationCount(random);
    handleAnalyze(random);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-[#1A1A1A] font-sans selection:bg-indigo-100">
      {/* Top Left: How to Use */}
      <div className="fixed top-6 left-6 z-[100]">
        <button 
          onClick={() => setShowHowToUse(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/50 font-bold text-sm hover:scale-105 transition-all text-indigo-900"
        >
          <HelpCircle className="w-4 h-4" />
          <span>사용방법</span>
        </button>
      </div>

      {/* API Key (Top Right) */}
      <div className="fixed top-6 right-6 z-[100] flex items-center gap-3">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-sm transition-all duration-500 backdrop-blur-md ${
          isKeySet 
            ? 'bg-green-50/80 text-green-600 border-green-200 shadow-green-100' 
            : 'bg-red-50/80 text-red-600 border-red-200 shadow-red-100 animate-pulse'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isKeySet ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
          {isKeySet ? 'API키 인증' : 'API키 미인증'}
        </div>
        <button 
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/50 flex items-center justify-center hover:scale-110 transition-all"
        >
          <Settings className={`w-5 h-5 ${isKeySet ? 'text-indigo-900' : 'text-red-500'}`} />
        </button>
      </div>

      {/* Bottom Right: Maintenance & Dashboard */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end">
        <a 
          href="https://hyeoksinai.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/50 font-bold text-xs text-gray-500 hover:text-indigo-900 transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>혁신 AI 대시보드 바로가기</span>
        </a>
        <button 
          onClick={() => setShowMaintenance(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/50 font-bold text-xs text-gray-500 hover:text-indigo-900 transition-all"
        >
          <Mail className="w-3 h-3" />
          <span>업데이트/유지보수 문의</span>
        </button>
      </div>

      {/* How to Use Modal */}
      <AnimatePresence>
        {showHowToUse && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black">돈버는 소싱 AI 사용방법</h3>
                <button onClick={() => setShowHowToUse(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <section>
                  <h4 className="font-black text-[#1A1A1A] mb-2">1. API 키 설정</h4>
                  <p>우측 상단의 설정 아이콘을 클릭하여 Google Gemini API 키를 입력하세요. 키가 있어야 AI 분석이 가능합니다.</p>
                </section>
                <section>
                  <h4 className="font-black text-[#1A1A1A] mb-2">2. 시기 및 시즌 선택</h4>
                  <p>분석하고자 하는 월(1월~12월) 또는 특정 시즌(봄, 여름, 명절 등)을 각각 최대 1개씩 선택하세요. 둘 중 하나만 선택해도 분석이 가능합니다.</p>
                </section>
                <section>
                  <h4 className="font-black text-[#1A1A1A] mb-2">3. 추천 개수 설정</h4>
                  <p>하단의 카테고리 버튼(3개, 5개, 7개, 10개)을 클릭하여 추천받고 싶은 상품의 개수를 설정하세요. '랜덤 즉시 추천' 버튼을 누르면 AI가 임의의 개수를 정해 즉시 분석을 시작합니다.</p>
                </section>
                <section>
                  <h4 className="font-black text-[#1A1A1A] mb-2">4. 분석 및 결과 확인</h4>
                  <p>'소싱 상품 추천받기' 버튼을 누르면 AI가 데이터를 분석하여 최적의 상품 리스트와 추천 이유, 시즌 특징을 상세히 알려줍니다.</p>
                </section>
              </div>
              <button 
                onClick={() => setShowHowToUse(false)}
                className="w-full mt-8 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold hover:shadow-xl transition-all"
              >
                확인했습니다
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Maintenance Modal */}
      <AnimatePresence>
        {showMaintenance && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4">업데이트/유지보수 문의</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                업데이트나 유지보수가 필요할 경우 아래 이메일로 어떤 부분이 필요한지 상세하게 작성 후 보내주세요.
              </p>
              <div className="bg-gray-50 p-4 rounded-2xl font-bold text-[#1A1A1A] mb-8 select-all">
                info@nextin.ai.kr
              </div>
              <button 
                onClick={() => setShowMaintenance(false)}
                className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold hover:shadow-xl transition-all"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key Modal */}
      <AnimatePresence>
        {showKeyInput && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black">Google API Key 설정</h3>
                <button onClick={() => setShowKeyInput(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                돈버는 소싱 AI 분석을 위해 Google API 키가 필요합니다. 입력하신 키는 브라우저에만 안전하게 저장됩니다.
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="API 키를 입력하세요"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#1A1A1A] focus:outline-none font-medium transition-all"
                  />
                </div>
                <button 
                  onClick={saveApiKey}
                  className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold hover:shadow-xl transition-all"
                >
                  설정 저장하기
                </button>
                <p className="text-[10px] text-center text-gray-400">
                  키가 없으신가요? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline">여기서 무료로 발급받기</a>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header className="relative w-full aspect-[21/9] md:aspect-[32/9] overflow-hidden bg-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/80 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&q=80&w=2000" 
          alt="돈버는 소싱 AI" 
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold mb-6"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>AI 기반 최적화 소싱 솔루션</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-lg"
          >
            <span className="text-yellow-400">돈</span>버는 소싱 AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-lg text-indigo-100/90 font-medium max-w-2xl"
          >
            대한민국 100만 개 이상의 상품 데이터를 <span className="text-yellow-400">돈</span>버는 소싱 AI가 분석하여<br className="hidden md:block" />
            시즌별 가장 강력한 매출을 발생시킬 최적의 상품을 발굴합니다.
          </motion.p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 -mt-16 md:-mt-24 relative z-30">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-8 md:p-12 border border-white/50">
          
          {/* Progress Bar */}
          {isAnalyzing || progress > 0 ? (
            <div className="mb-12">
              {isAnalyzing && progress < 100 ? (
                <div className="flex flex-col items-center justify-center py-8 mb-8 bg-blue-50/50 rounded-3xl border border-blue-100">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-b-indigo-500 border-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                    <Search className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-black mb-2 text-blue-900 animate-pulse">혁신 소싱 AI가 최적의 상품을 리서치중입니다. 잠시만 기다려주세요!</h3>
                  <p className="text-blue-700/80 font-medium text-center text-sm max-w-md">
                    대한민국 <span className="text-blue-600 font-bold">100만 개 이상</span>의 상품 데이터베이스에서<br/>
                    최적의 소싱 상품을 실시간으로 발굴하고 있습니다.
                  </p>
                </div>
              ) : null}
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
                <h2 className="text-2xl font-bold tracking-tight">시기 및 시즌 선택</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Months Grid */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Monthly Selection (최대 1개)</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {MONTHS.map(month => (
                      <button
                        key={month}
                        onClick={() => toggleMonth(month)}
                        className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                          selectedMonth === month
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
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Seasonal Context (최대 1개)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {SEASONS.map(season => (
                      <button
                        key={season}
                        onClick={() => toggleSeason(season)}
                        className={`py-3 px-4 rounded-xl text-xs font-bold text-left transition-all duration-200 ${
                          selectedSeason === season
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
                  <span>선택된 항목: {[selectedMonth, selectedSeason].filter(Boolean).join(", ") || "없음"}</span>
                </div>

                {/* Recommendation Count Selector */}
                <div className="mb-10 w-full max-w-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">추천받을 개수 설정</h3>
                      <p className="text-[10px] text-gray-400 mt-1">원하시는 추천 상품의 개수를 카테고리별로 선택하세요.</p>
                    </div>
                    <button 
                      onClick={handleRandomAnalyze}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      랜덤 즉시 추천
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: '최소 추천', count: 3, desc: '핵심 상품 위주' },
                      { label: '기본 추천', count: 5, desc: '가장 대중적인 구성' },
                      { label: '심화 추천', count: 7, desc: '다양한 대안 포함' },
                      { label: '최대 추천', count: 10, desc: '광범위한 시장 분석' }
                    ].map((cat) => (
                      <button
                        key={cat.count}
                        onClick={() => setRecommendationCount(cat.count)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                          recommendationCount === cat.count
                            ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-xl scale-105'
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg font-black mb-1">{cat.count}개</span>
                        <span className={`text-[10px] font-bold ${recommendationCount === cat.count ? 'text-gray-400' : 'text-gray-400'}`}>
                          {cat.label}
                        </span>
                        <span className={`text-[9px] mt-1 opacity-60 ${recommendationCount === cat.count ? 'text-gray-300' : 'text-gray-400'}`}>
                          {cat.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => handleAnalyze()}
                  disabled={(!selectedMonth && !selectedSeason) || isAnalyzing}
                  className={`group relative px-12 py-5 rounded-full font-black text-lg transition-all duration-300 flex items-center gap-3 ${
                    (selectedMonth || selectedSeason) && !isAnalyzing
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
                  위 추천 상품들은 선택하신 <span className="text-[#1A1A1A] font-bold">"{[selectedMonth, selectedSeason].filter(Boolean).join(", ")}"</span> 조건에 맞춰<br/>
                  <span className="text-blue-600 font-bold">대한민국 100만 개 이상의 상품 데이터</span>를 딥 리서치하여 도출된 최적의 결과입니다.
                </p>
                <div className="flex justify-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Search className="w-4 h-4" />
                    <span>Google Gemini 딥 리서치 완료</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>시장 트렌드 최적화</span>
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
