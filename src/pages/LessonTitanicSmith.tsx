import TitanicSmith from "./TitanicSmith";
import "./LessonTitanic.css";

export default function LessonTitanicSmith() {
  return (
    <article className="lesson-page">
      <p className="lesson-page__eyebrow">LESSON</p>
      <h1 className="lesson-page__title">타이타닉 모델 분석</h1>
      <div className="lesson-page__content">
        <TitanicSmith />
      </div>
    </article>
  );
}
