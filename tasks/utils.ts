import { ContractTransaction } from 'ethers'

export async function waitTx(tx: ContractTransaction) {
  console.log('Hash =>', tx.hash)
  const txResult = await tx.wait()
  if (txResult.events) {
    txResult.events.forEach((event) => {
      console.log('Event Index =>', event.logIndex)
      console.log('Event Name =>', event.event)
      console.log('Args =>', event.args)
      console.log('Args String =>', event.args?.toString())
      console.log('------------------------------------------------------------------------------------------')
    })
  }
}
