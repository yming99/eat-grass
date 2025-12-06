export default function Footer() {
  return (
    <footer className="hidden md:flex h-[60px] bg-[#DDEB9D] items-center justify-center fixed bottom-0 left-0 right-0 z-30">
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-6 text-center text-sm text-neutral-700">
        <span>© {new Date().getFullYear()} Eat Grass. All rights reserved.</span>
        <span className="mx-2">•</span>
        <span>Version 1.0.0</span>
      </div>
    </footer>
  )
}


