import wavezyncLogoDark from '../../../../../resources/wavezync-dark.png?asset'

export const MadeWithLove = () => (
  <div className="flex justify-center items-center py-2">
    <span className="text-xs text-secondary-foreground mr-1">Made with ❤️</span>
    <a href="https://wavezync.com" target="_blank" rel="noreferrer">
      <img src={wavezyncLogoDark} alt="WaveZync" className="h-4" />
    </a>
  </div>
)
