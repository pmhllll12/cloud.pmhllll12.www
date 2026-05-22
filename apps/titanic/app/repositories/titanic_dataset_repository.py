"""Titanic CSV 접근 — secom UserRepository와 같은 데이터 접근 층."""

from __future__ import annotations

from pathlib import Path

import pandas as pd

_TITANIC_ROOT = Path(__file__).resolve().parents[2]
_CSV_PATH = _TITANIC_ROOT / "data" / "Titanic-Dataset.csv"


class TitanicDatasetRepository:
    """Kaggle식 Titanic 탑승객 명단 CSV."""

    def _read_csv(self) -> pd.DataFrame:
        return pd.read_csv(_CSV_PATH)

    def get_preview_row_dataframe(self) -> pd.DataFrame:
        """기존 동작: 첫 데이터 행만 JSON 응답용으로 반환."""
        df = self._read_csv()
        row = df.iloc[[0]].astype(object).where(df.iloc[[0]].notna(), None)
        return row

    def count_passengers(self) -> int:
        return int(self._read_csv().shape[0])

    def load_full_dataframe(self) -> pd.DataFrame:
        """학습·분석용 전체 프레임."""
        return self._read_csv()
