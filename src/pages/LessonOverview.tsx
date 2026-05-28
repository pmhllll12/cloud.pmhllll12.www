import "./LessonOverview.css";

export default function LessonOverview() {
  return (
    <article className="lesson-overview">
      <div className="lesson-overview__grid">
        <div className="lesson-overview__main">
          <p className="lesson-overview__eyebrow">LESSON</p>
          <h1 className="lesson-overview__title">타이타닉 모델 분석</h1>
          <p className="lesson-overview__lead">
            본 수업은 타이타닉 침몰 사건을 데이터 분석과 머신러닝 관점에서 살펴보고,
            승객 정보를 바탕으로 생존 여부를 예측하는 분류 모델을 다룹니다.
          </p>

          <section className="lesson-overview__section" aria-labelledby="lesson-goals">
            <h2 id="lesson-goals" className="lesson-overview__h2">
              학습 목표
            </h2>
            <ul className="lesson-overview__list">
              <li>데이터 수집 및 전처리 기술 습득</li>
              <li>탐색적 데이터 분석(EDA) 실습</li>
              <li>분류 모델 개발 및 성능 평가</li>
              <li>실제 데이터 기반 인사이트 도출</li>
            </ul>
          </section>

          <section className="lesson-overview__section" aria-labelledby="lesson-topics">
            <h2 id="lesson-topics" className="lesson-overview__h2">
              주요 내용
            </h2>
            <ul className="lesson-overview__list">
              <li>타이타닉 탑승객 데이터셋 분석</li>
              <li>성별, 연령, 좌석 등급에 따른 생존율 분석</li>
              <li>로지스틱 회귀 모델을 이용한 생존 예측</li>
              <li>모델 성능 평가 및 해석</li>
            </ul>
          </section>
        </div>

        <aside className="lesson-overview__card" aria-label="타이타닉 수업 요약">
          <div className="lesson-overview__card-block">
            <span className="lesson-overview__card-icon" aria-hidden>
              🚢
            </span>
            <div>
              <p className="lesson-overview__card-title">Titanic</p>
              <p className="lesson-overview__card-line">1912년 침몰</p>
              <p className="lesson-overview__card-line">1,500명 이상 사망</p>
            </div>
          </div>
          <div className="lesson-overview__card-block">
            <span className="lesson-overview__card-icon" aria-hidden>
              📊
            </span>
            <div>
              <p className="lesson-overview__card-title">데이터</p>
              <p className="lesson-overview__card-line">2,224명 탑승객</p>
            </div>
          </div>
          <div className="lesson-overview__card-block">
            <span className="lesson-overview__card-icon" aria-hidden>
              🔍
            </span>
            <div>
              <p className="lesson-overview__card-title">데이터 분석</p>
              <p className="lesson-overview__card-line">EDA · 시각화</p>
            </div>
          </div>
          <div className="lesson-overview__card-block">
            <span className="lesson-overview__card-icon" aria-hidden>
              🤖
            </span>
            <div>
              <p className="lesson-overview__card-title">머신러닝 모델</p>
              <p className="lesson-overview__card-line">분류 · 평가</p>
            </div>
          </div>
        </aside>
      </div>

      <p className="lesson-overview__footer-hint">
        실습 화면은 사이드바의 <strong>「1. 데이터 수집 및 실습」</strong>에서 열 수 있습니다.
      </p>
    </article>
  );
}
