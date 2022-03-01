const { expect } = require('chai')
const { ethers } = require('hardhat')
const { ZERO_ADDRESS } = require('../constants')

describe('Storage', function () {
  const KEY1 = 'localhost'
  let wallet
  let wallet2
  let storage

  this.beforeAll(async () => {
    const [owner, addr1] = await ethers.getSigners()

    wallet = owner
    wallet2 = addr1

    const Storage = await ethers.getContractFactory('Storage')
    storage = await Storage.deploy()

    await storage.deployed()

    console.log('wallet.address: ', wallet.address)
    console.log('wallet2.address: ', wallet2.address)
    console.log('KEY1: ', KEY1)
  })

  it('should be empty data by default', async () => {
    const allKeysData = await storage.allKeysData()
    const keys = await storage.allKeys()

    expect(allKeysData.length).to.eq(0)
    expect(keys.length).to.eq(0)

    const data = await storage.getData(KEY1)

    expect(data.owner).to.eq(ZERO_ADDRESS)
    expect(data.info).to.eq('')
  })

  it('should set data', async () => {
    const defaultInfo = JSON.stringify({
      copyrightName: 'XYZ',
    })

    await storage.setKeyData(KEY1, {
      owner: wallet.address,
      info: defaultInfo,
    })

    const allKeysData = await storage.allKeysData()
    const keys = await storage.allKeys()
    const data = await storage.getData(KEY1)

    expect(allKeysData[0].owner).to.eq(wallet.address)
    expect(allKeysData[0].info).to.eq(defaultInfo)

    expect(keys.length).to.eq(1)
    expect(keys[0]).to.eq(KEY1)

    expect(data.owner).to.eq(wallet.address)
    expect(data.info).to.eq(defaultInfo)
  })

  it('should update data', async () => {
    await storage.setKeyData(KEY1, {
      owner: wallet.address,
      info: JSON.stringify({
        copyrightName: 'XYZ_1',
      }),
    })

    const data = await storage.getData(KEY1)

    expect(data.owner).to.eq(wallet.address)
    expect(data.info).to.eq(
      JSON.stringify({
        copyrightName: 'XYZ_1',
      })
    )
  })

  it('should clear data', async () => {
    let data = await storage.getData(KEY1)
    let keys = await storage.allKeys()

    await storage.clearData(KEY1)

    data = await storage.getData(KEY1)
    keys = await storage.allKeys()

    expect(data.owner).to.eq(ZERO_ADDRESS)
    expect(data.info).to.eq('')
    expect(keys.length).to.eq(0)
  })

  it('should set keys data and clear custom key data', async () => {
    await storage.setKeysData([
      {
        key: 'A',
        data: {
          owner: wallet.address,
          info: 'A info',
        },
      },
      {
        key: 'B',
        data: {
          owner: wallet.address,
          info: 'B info',
        },
      },
      {
        key: 'C',
        data: {
          owner: wallet.address,
          info: 'C info',
        },
      },
    ])

    let allKeysData = await storage.allKeysData()
    let keys = await storage.allKeys()
    let dataA = await storage.getData('A')
    let dataB = await storage.getData('B')
    let dataC = await storage.getData('C')

    expect(allKeysData.length).to.eq(3)
    expect(keys.length).to.eq(3)

    expect(dataA.owner).to.eq(wallet.address)
    expect(dataA.info).to.eq('A info')
    expect(dataB.owner).to.eq(wallet.address)
    expect(dataB.info).to.eq('B info')
    expect(dataC.owner).to.eq(wallet.address)
    expect(dataC.info).to.eq('C info')

    await storage.clearData('B')

    allKeysData = await storage.allKeysData()
    keys = await storage.allKeys()
    dataA = await storage.getData('A')
    dataB = await storage.getData('B')
    dataC = await storage.getData('C')

    expect(allKeysData.length).to.eq(2)
    expect(keys.length).to.eq(2)

    expect(dataA.owner).to.eq(wallet.address)
    expect(dataA.info).to.eq('A info')
    expect(dataB.owner).to.eq(ZERO_ADDRESS)
    expect(dataB.info).to.eq('')
    expect(dataC.owner).to.eq(wallet.address)
    expect(dataC.info).to.eq('C info')
  })

  // TODO: how to change main wallet ?
  // it("should fail with FORBIDDEN", async () => {
  //   await expect(
  //     storage.setKeyData(KEY1, {
  //       owner: wallet2.address,
  //       info: JSON.stringify({
  //         copyrightName: "XYZ_2",
  //       }),
  //     })
  //   ).to.be.revertedWith("FORBIDDEN");
  // });
})
