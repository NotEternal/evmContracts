const { expect } = require('chai')
const { ethers, waffle } = require('hardhat')
const { ZERO_ADDRESS } = require('../constants')

describe('Dash', function () {
  const { provider } = waffle
  let wallet
  let wallet2
  let dash
  let dai

  this.beforeAll(async () => {
    const [owner, addr1] = await ethers.getSigners()

    wallet = owner
    wallet2 = addr1

    const Dai = await ethers.getContractFactory('Dai')

    dai = await Dai.deploy(123)

    await dai.mint(wallet.address, 1_000_000_000)

    const Dash = await ethers.getContractFactory('Dash')

    dash = await Dash.deploy(
      wallet.address,
      wallet2.address,
      dai.address,
      1_000,
      '0x0000000000000000000000000000000000000001'
    )

    await dash.deployed()
  })

  it('should set product price', async () => {
    await dash.setProductPrice('dex', 935)
    await dash.setProductPrice('dao', 800)
  })

  it('should be a successful payment without reward', async () => {
    await dash.payment('dex', '{dex: 935}', wallet2.address, {
      value: '2520000000000000000',
    })

    const data = await dash.getData(wallet.address)
    const sourceBalance = await provider.getBalance(wallet.address)
    const destBalance = await provider.getBalance(wallet2.address)
    const destTokenBalance = await dai.balanceOf(wallet2.address)

    expect(data).to.eq('{dex: 935}')
    expect(sourceBalance).to.eq('9997474538705105861445')
    expect(destBalance.toString()).to.eq('10002520000000000000000')
    expect(destTokenBalance.toString()).to.eq('0')
  })

  it('should send reward token to Dash', async () => {
    await dai.approve(dash.address, 100_000)
    await dai.transferFrom(wallet.address, dash.address, 100_000)

    const dashTokenBalance = await dai.balanceOf(dash.address)

    expect(dashTokenBalance.toString()).to.eq('100000')
  })

  it('should be a successful payment with reward', async () => {
    await dash.payment('dao', '{dex: 900, dao: 800}', wallet2.address, {
      value: '2156536354425493500',
    })

    const data = await dash.getData(wallet.address)
    const sourceBalance = await provider.getBalance(wallet.address)
    const destBalance = await provider.getBalance(wallet2.address)
    const destTokenBalance = await dai.balanceOf(wallet2.address)

    expect(data).to.eq('{dex: 900, dao: 800}')
    expect(sourceBalance).to.eq('9995317738806057774812')
    expect(destBalance.toString()).to.eq('10004676536354425493500')
    expect(destTokenBalance.toString()).to.eq('1000')
  })

  it('should be a correct new reward amount', async () => {
    await dash.setRewardAmount(50)
    await dash.payment('dex', '{dex: 900, dao: 800}', wallet2.address, {
      value: '2520000000000000000',
    })

    const destTokenBalance = await dai.balanceOf(wallet2.address)
    expect(destTokenBalance.toString()).to.eq('1050')
  })

  it('payment should be blocked', async () => {
    await dash.setBlocked(true)
    const r = await dash.payment(
      'dex',
      '{dex: 900, dao: 800}',
      wallet2.address,
      {
        value: '',
      }
    )

    console.log('r: ', r)
  })
})
