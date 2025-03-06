import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/Home.module.scss";
import useGeolocation from "../hooks/useGeolocation";
import useReverseGeocoding from "../hooks/useReverseGeocoding";
import useGenres from "../hooks/useGenres";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const Home = () => {
  const navigate = useNavigate();

  // 위치 정보 가져오기
  const { location, error: locationError } = useGeolocation();
  const { address, error: addressError } = useReverseGeocoding(
    location?.lat,
    location?.lng
  );

  // 선택된 조건을 저장할 상태
  const [selectedGenres, setSelectedGenres] = useState([]); // 복수 선택을 위해 배열 사용
  const [selectedOptions, setSelectedOptions] = useState([]); // 옵션 (WiFi, 카드 결제 등)
  const [selectedDistance, setSelectedDistance] = useState(null);

  // 위치 정보를 저장할 상태
  const [currentLocation, setCurrentLocation] = useState(null);

  // 장르 정보 가져오기
  const { genres, error: genreError } = useGenres();

  // 위치 정보 업데이트
  useEffect(() => {
    if (address) {
      setCurrentLocation(address);
    }
  }, [address]);

  const optionMappings = {
    英語メニュー: "english",
    WiFi: "wifi",
    カード払い: "card",
    禁煙席: "non_smoking",
  };

  // 장르 버튼 클릭 시 선택한 장르 저장
  const handleGenreClick = (genre) => {
    setSelectedGenres(
      (prevGenres) =>
        prevGenres.includes(genre.code)
          ? prevGenres.filter((g) => g !== genre.code) // 클릭 시 제거
          : [...prevGenres, genre.code] // 클릭 시 추가
    );
  };

  //옵션 체크박스 클릭 시 선택된 옵션 업데이트
  const handleOptionChange = (option) => {
    const apiField = optionMappings[option]; // UI 옵션명을 API 필드명으로 변환
    if (!apiField) return;

    console.log(`🔹 옵션 선택: ${option} (API 필드: ${apiField})`);

    setSelectedOptions(
      (prevOptions) =>
        prevOptions.includes(apiField)
          ? prevOptions.filter((o) => o !== apiField) // 선택 해제 시 제거
          : [...prevOptions, apiField] // 선택 시 추가
    );
  };

  // 거리 버튼 클릭 시 선택된 거리 저장
  const handleDistanceClick = (distance) => {
    console.log("🔹 거리 선택:", distance);
    setSelectedDistance(distance);
  };

  // "検索" 버튼 클릭 시 선택한 조건을 URL 쿼리로 전달하여 `Result.jsx`로 이동
  const handleSearch = () => {
    if (!selectedDistance) {
      Swal.fire({
        icon: "error",
        title: "あれ？",
        text: "検索を行うには距離を選択してください！",
      });
      return;
    }

    const queryParams = new URLSearchParams();

    if (selectedGenres.length > 0)
      queryParams.append("genre", selectedGenres.join(",")); // 복수 선택된 장르를 콤마(,)로 구분
    if (selectedOptions.length > 0)
      queryParams.append("options", selectedOptions.join(","));
    if (selectedDistance) queryParams.append("distance", selectedDistance);

    navigate(`/result?${queryParams.toString()}`);
  };

  return (
    <div className={styles.home}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.backgroundContainer}>
          {/* 배경 이미지 적용 */}
          <div className={styles.backgroundImage}></div>

          {/* 내용 부분 */}
          <div className={styles.content}>
            <div className={styles.logoImageSection}>
              <img src="/logo.png" alt="Logo" className={styles.logo} />
            </div>
            <p className={styles.logoTitle}>韓グルマップ</p>
            <p className={styles.description}>
              韓グルマップは<br></br>現在地周辺のグルメを<br></br>
              教えてくれるサービスです
            </p>
          </div>
        </div>

        {/* 📍 현재 위치 */}
        <div className={styles.locationLine}>
          {currentLocation ? (
            <p className={styles.location}>📍 {currentLocation}</p>
          ) : addressError || locationError ? (
            <p className={styles.error}>
              エラー: {addressError || locationError}
            </p>
          ) : (
            <p className={styles.location}>位置情報を取得中...</p>
          )}
          {/* 🔍 検索 버튼 */}
          <button className={styles.searchButton} onClick={handleSearch}>
            検索
          </button>
        </div>

        {/* 🍽 料理・ジャンル 선택 */}
        <div className={styles.byCategory}>
          <h1 className={styles.titleCategory}>料理・ジャンルで検索</h1>
          <p className={styles.descriptionCategory}>✏️ 複数選択可能、未選択時に全体選択で適用されます。</p>
          <div className={styles.buttonsCategory}>
            {genreError ? (
              <p className={styles.error}>エラー: {genreError}</p>
            ) : genres.length > 0 ? (
              genres.map((genre) => (
                <button
                  key={genre.code}
                  className={`${styles.buttonCategory} ${
                    selectedGenres.includes(genre.code) ? styles.selected : "" // 복수 선택 가능하도록 수정
                  }`}
                  onClick={() => handleGenreClick(genre)}
                >
                  {genre.name}
                </button>
              ))
            ) : (
              <p>ジャンルを読み込み中...</p>
            )}
          </div>
        </div>

        {/* 옵션 선택 */}
        <div className={styles.byOption}>
          <p>条件で検索</p>
          <div className={styles.optionLabels}>
            {Object.keys(optionMappings).map((option) => (
              <label key={option}>
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(optionMappings[option])}
                  onChange={() => handleOptionChange(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* 🔍 거리 선택 */}
        <div className={styles.byDistance}>
          <p>距離で検索</p>
          <div className={styles.buttonsDistance}>
            {[300, 500, 1000, 2000, 3000].map((distance) => (
              <button
                key={distance}
                className={`${styles.buttonDistance} ${
                  selectedDistance === distance ? styles.selected : ""
                }`}
                onClick={() => handleDistanceClick(distance)}
              >
                {distance}m以内
              </button>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
