import TitanicPassengers from "./TitanicPassengers";
import "./LessonTitanic.css";

export default function LessonTitanicPassengers() {
  return (
    <article className="lesson-page lesson-page--wide">
      <p className="lesson-page__eyebrow">LESSON</p>
      <h1 className="lesson-page__title">타이타닉 모델 분석</h1>
      <div className="lesson-page__content">
        <TitanicPassengers />
      </div>
    </article>
  );
}
