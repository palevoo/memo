import Head from 'next/head'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { hexlify } from "@ethersproject/bytes"
import { toUtf8Bytes } from "@ethersproject/strings"
import { useEnsAddress, usePrepareSendTransaction, useSendTransaction } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import styles from '../styles/Home.module.css'
import useCopy from '../hooks/useCopy'
import { formatEther, isAddress, parseEther } from 'ethers/lib/utils.js'
import useDebouncedState from '../hooks/useDebounce'

type SendProps = {
  hex: string
}

const formatError = (error: string) => {
  const index = error.indexOf("[" || "(")
  let formatted = error.slice(0, index)
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1)
  formatted = formatted.trim()

  return formatted
}

const Send = ({ hex }: SendProps) => {

  const [amount, setAmount] = useState("")
  const [toInput, setToInput] = useState("")
  const [debouncedToInput, setDebouncedToInput] = useDebouncedState<string>(toInput, 1000)
  const [to, setTo] = useState("")

  const value = parseEther(amount && amount !== "." ? amount : "0")

  const { config, error } = usePrepareSendTransaction({
    request: { to: to, value, data: hex, },
  })
  const { data, error: errorTx, isLoading, isSuccess, sendTransaction } = useSendTransaction(config)

  const { data: address, error: errorEns, isError: isErrorEns, isLoading: isLoadingEns } = useEnsAddress({
    name: debouncedToInput,
  })

  useEffect(() => {
    if (isAddress(toInput)) {
      setTo(toInput)
    }
  }, [toInput])

  useEffect(() => {
    if (address && isAddress(address)) {
      setTo(address)
    }
  }, [address])

  const notifyError = (err: string) => {
    toast(formatError(err), {
      position: 'bottom-center',
      theme: 'dark',
      type: 'warning',
      bodyStyle: {
        fontWeight: '400',
        color: 'rgba(#ffffff, 0.25)',
      },
      style: {

        backgroundColor: 'rgba(var(--callout-rgb), 1)',
        border: '1px solid rgba(var(--card-border-rgb), 0.15)'
      }
    })
  }

  useEffect(() => {
    if (error?.message) {
      notifyError(error?.message)
    }
  }, [error])

  useEffect(() => {
    if (errorTx?.message) {
      notifyError(errorTx?.message)
    }
  }, [errorTx])


  const onChangeTo = (e: ChangeEvent<HTMLInputElement>) => {
    if (to) {
      setTo("")
    }

    setToInput(e.target.value || "")
    setDebouncedToInput(e.target.value || "")
  }

  const onChangeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const re = /^[0-9]*[.,]?[0-9]*$/

    if (e.target.value === '' || re.test(e.target.value)) {
      setAmount(e.target.value)
    }
  }

  const isDisabled = useMemo(() => !sendTransaction || !isAddress(to) || isLoading, [sendTransaction, to, isLoading])

  return (
    <div>
      <label className={styles.label}>Amount</label>
      <input className={styles.input} value={amount} onChange={onChangeAmount} />
      <label className={styles.label}>To</label>
      <input className={styles.input} value={toInput} placeholder="address or ens" onChange={onChangeTo} />
      <button className={styles.button} disabled={isDisabled} onClick={() => sendTransaction?.()}>Send {formatEther(value)} ETH</button>
      <code className={styles.code}>
        <span className={styles.codeLabel}>Amount:</span> {formatEther(value)}<br />
        <span className={styles.codeLabel}>To:</span>     {to}<br />
        <span className={styles.codeLabel}>Data:</span>   {hex}
      </code>
    </div>
  )
}

export default function Home() {
  const [message, setMessage] = useState("")
  const [hex, setHex] = useState("")
  const [_value, isCopying, copy] = useCopy()

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    setHex(hexlify(toUtf8Bytes(e.target.value)))
  }

  return (
    <>
      <Head>
        <title>memo</title>
        <meta name="description" content="Easily send an ethereum transaction with a message attached" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.header}>
          <ConnectButton label="Connect to send" chainStatus={"full"} />
        </div>

        <div className={styles.center}>
          <label className={styles.label}>Message</label>
          <input autoFocus={true} className={styles.input} value={message} onChange={onChange} />
          <label className={styles.label}>Hex</label>
          <div className={styles.textareaContainer}>
            <textarea className={styles.input} disabled={true} value={hex} />
            <button disabled={hex.length < 1} onClick={() => copy(hex)} className={styles.copy}>{isCopying ? "copied" : "copy"}</button>
          </div>
          <Send hex={hex} />
        </div>
        <ToastContainer />
      </main>
    </>
  )
}
