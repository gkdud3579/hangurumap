import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/Header.module.scss";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDetailPage = location.pathname.startsWith("/detail"); // `/detail` 페이지 여부 확인

  return (
    <header className={styles.header}>
      {/* 戻るボタン (Detailページでのみ見えるように) */}
      {isDetailPage && (
        <button
          className={styles.backButton}
          onClick={() =>
            navigate("/result", {
              state: {
                fromDetail: true,
                prevPage: localStorage.getItem("currentPage"),
              },
              replace: true,
            })
          }
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      )}

      {/* Logo */}
      <Link
        to="/"
        onClick={() => navigate("/", { replace: true })} // ✅ 로고 클릭 시 강제 리렌더링
        className={`${styles.logoContainer} ${
          isDetailPage ? styles.centeredLogo : ""
        }`}
      >
        <img src="/logo.png" alt="Logo" className={styles.logo} />
      </Link>
    </header>
  );
};

export default Header;
