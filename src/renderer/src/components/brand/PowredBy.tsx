import wavezyncLogoDark from '../../../../../resources/wavezync-dark.png?asset'
// import wavezyncLogoLight from '../../../../resources/wavezync-light.png?asset'

export const PoweredBy = () => (
  <div className="absolute bottom-5 flex justify-center items-center">
    <div className="text-xs text-secondary-foreground mr-1">Powered by</div>
    <a href="https://wavezync.com" target="_blank" rel="noreferrer">
      <img src={wavezyncLogoDark} alt="Wavezync" className="h-5" />
    </a>
  </div>
)
