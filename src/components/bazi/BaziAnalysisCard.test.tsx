import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BaziAnalysisCard } from './BaziAnalysisCard'
import { MOCK_BAZI } from '@/test/fixtures'

describe('BaziAnalysisCard', () => {
  it('should render the header', () => {
    render(<BaziAnalysisCard data={MOCK_BAZI} />)
    expect(screen.getByText('八字命理分析')).toBeInTheDocument()
  })

  it('should display four pillars', () => {
    render(<BaziAnalysisCard data={MOCK_BAZI} />)

    expect(screen.getByText('甲辰')).toBeInTheDocument()
    expect(screen.getByText('丙寅')).toBeInTheDocument()
    expect(screen.getByText('戊午')).toBeInTheDocument()
    expect(screen.getByText('壬子')).toBeInTheDocument()
  })

  it('should display benming and rizhu info', () => {
    render(<BaziAnalysisCard data={MOCK_BAZI} />)

    // "本命：龙 · 日主：戊（土）· 身弱"
    const infoEl = screen.getByText(/本命：龙/)
    expect(infoEl).toBeInTheDocument()
    expect(infoEl.textContent).toContain('日主：戊')
    expect(infoEl.textContent).toContain('身弱')
  })

  it('should display wuxing stats section', () => {
    render(<BaziAnalysisCard data={MOCK_BAZI} />)
    expect(screen.getByText('五行分布')).toBeInTheDocument()
  })

  it('should display wuxing radar chart', () => {
    render(<BaziAnalysisCard data={MOCK_BAZI} />)
    expect(screen.getByText('五行力量图')).toBeInTheDocument()
  })

  it('should display AI analysis text', () => {
    render(<BaziAnalysisCard data={MOCK_BAZI} />)
    expect(screen.getByText('AI 大师解读')).toBeInTheDocument()
    expect(
      screen.getByText(MOCK_BAZI.analysis)
    ).toBeInTheDocument()
  })

  it('should display suggestion', () => {
    render(<BaziAnalysisCard data={MOCK_BAZI} />)
    expect(
      screen.getByText(`💡 建议：${MOCK_BAZI.suggestion}`)
    ).toBeInTheDocument()
  })
})
