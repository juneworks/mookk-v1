/**
 * MOOKK 통합 수수료 8.0% 및 부가가치세(VAT 10%) 세무 연산 유틸리티
 */

export interface FeeBreakdown {
  totalAmount: number         // 총 모금액 (Gross Amount)
  feeRate: number             // 통합 수수료율 (8.0% = 0.08)
  totalFeeAmount: number      // 통합 수수료 총액 (VAT 포함)
  feeSupplyValue: number      // 수수료 공급가액
  feeVat: number              // 수수료 부가가치세 (VAT 10%)
  netSettlementAmount: number // 최종 창작자 입금 예정액 (Net Settlement)
}

/**
 * 총 모금액 기준 정산액 및 수수료 명세 계산
 * @param totalAmount 총 모금액 (원)
 * @returns FeeBreakdown 정산 및 세무 명세
 */
export function calculateSettlementFee(totalAmount: number): FeeBreakdown {
  if (!totalAmount || totalAmount < 0) {
    return {
      totalAmount: 0,
      feeRate: 0.08,
      totalFeeAmount: 0,
      feeSupplyValue: 0,
      feeVat: 0,
      netSettlementAmount: 0,
    }
  }

  // 1. 통합 수수료 총액 (8.0%)
  const totalFeeAmount = Math.floor(totalAmount * 0.08)

  // 2. 수수료 공급가액 (VAT 제외) = 수수료 총액 / 1.1
  const feeSupplyValue = Math.round(totalFeeAmount / 1.1)

  // 3. 수수료 부가가치세 (VAT 10%) = 수수료 총액 - 공급가액
  const feeVat = totalFeeAmount - feeSupplyValue

  // 4. 최종 입금 예정액 = 총 모금액 - 통합 수수료 총액
  const netSettlementAmount = totalAmount - totalFeeAmount

  return {
    totalAmount,
    feeRate: 0.08,
    totalFeeAmount,
    feeSupplyValue,
    feeVat,
    netSettlementAmount,
  }
}
