// 시작 화면·로그인 화면 아래에 일렁이는 바다 물결 (.intro-waves 스타일은 theme.css)
export default function Waves() {
  return (
    <svg className="intro-waves" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
      <path className="w1" d="M0 70 C240 20 480 120 720 70 S1200 20 1440 70 V160 H0Z" fill="#8fd6d6" opacity=".55" />
      <path className="w2" d="M0 100 C260 60 520 140 780 100 S1220 60 1440 100 V160 H0Z" fill="#2a9d8f" opacity=".75" />
    </svg>
  )
}
