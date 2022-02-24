const { expect } = require('chai')
const { ethers } = require('hardhat')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

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

    await storage.setData(KEY1, {
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
    await storage.setData(KEY1, {
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
    await storage.clearData(KEY1)

    const data = await storage.getData(KEY1)

    expect(data.owner).to.eq(ZERO_ADDRESS)
    expect(data.info).to.eq('')
  })

  // TODO: how to change main wallet ?
  // it("should fail with FORBIDDEN", async () => {
  //   await expect(
  //     storage.setData(KEY1, {
  //       owner: wallet2.address,
  //       info: JSON.stringify({
  //         copyrightName: "XYZ_2",
  //       }),
  //     })
  //   ).to.be.revertedWith("FORBIDDEN");
  // });
})
