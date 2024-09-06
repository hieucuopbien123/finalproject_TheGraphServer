import { BigInt, log, Bytes, Address, ethereum } from "@graphprotocol/graph-ts"
import {
  AuctionCreated,
  AuctionFinalized,
  BidAuction,
  Initialized,
  OwnershipTransferred,
  Paused,
  RevealAuction,
  RevealStarted,
  Unpaused,
  UpdateAuction
} from "../generated/AuctionFactory/AuctionFactory"
import { DutchAuction } from "../generated/AuctionFactory/DutchAuction";
import { EnglishAuction } from "../generated/AuctionFactory/EnglishAuction";
import { SealedBidAuctionV1 } from "../generated/AuctionFactory/SealedBidAuctionV1";
import { SealedBidAuctionV2 } from "../generated/AuctionFactory/SealedBidAuctionV2";
import { VickreyAuction } from "../generated/AuctionFactory/VickreyAuction";
import { Stat, Volume, AuctionCommon, AuctionDetail, Trade, User, NFT, Collection } from "../generated/schema";

function getDistinctAddresses(addresses: Array<Address>): Array<Address> {
  let distinctAddresses: Array<Address> = new Array<Address>();
  for (let i = 0; i < addresses.length; i++) {
    let isDistinct = true;
    for (let j = 0; j < distinctAddresses.length; j++) {
      if (addresses[i] == distinctAddresses[j]) {
        isDistinct = false;
        break;
      }
    }
    if (isDistinct) {
      distinctAddresses.push(addresses[i]);
    }
  }
  return distinctAddresses;
}

export function handleAuctionCreated(event: AuctionCreated): void {
  let nftAddresses: Array<Address> = [];
  let auctionType = 0;
  let tokenIds: Array<BigInt> = [];
  let tokenCounts: Array<BigInt> = [];
  let isFailed = false;
  if(event.params.auctionType == BigInt.fromI32(0)) {
    let auctionContract = EnglishAuction.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
      tokenIds = nftInfo.value.getValue1();
      tokenCounts = nftInfo.value.getValue2();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  } else if(event.params.auctionType == BigInt.fromI32(1)) {
    auctionType = 1;
    let auctionContract = VickreyAuction.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
      tokenIds = nftInfo.value.getValue1();
      tokenCounts = nftInfo.value.getValue2();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  } else if(event.params.auctionType == BigInt.fromI32(2)) {
    auctionType = 2;
    let auctionContract = DutchAuction.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
      tokenIds = nftInfo.value.getValue1();
      tokenCounts = nftInfo.value.getValue2();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  } else if(event.params.auctionType == BigInt.fromI32(3)) {
    auctionType = 3;
    let auctionContract = SealedBidAuctionV1.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
      tokenIds = nftInfo.value.getValue1();
      tokenCounts = nftInfo.value.getValue2();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  } else if(event.params.auctionType == BigInt.fromI32(4)) {
    auctionType = 4;
    let auctionContract = SealedBidAuctionV2.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
      tokenIds = nftInfo.value.getValue1();
      tokenCounts = nftInfo.value.getValue2();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  }

  if(isFailed == false){
    let distinctNFTAddresses = getDistinctAddresses(nftAddresses);

    // AuctionDetail
    let auctionDetail = new AuctionDetail(event.params.auction);
    auctionDetail.auctionType = auctionType;
    auctionDetail.status = 0;
    auctionDetail.collectionAddress = changetype<Bytes[]>(nftAddresses);
    auctionDetail.nftIds = tokenIds;
    auctionDetail.nftCount = tokenCounts;
    auctionDetail.timestamp = event.block.timestamp;

    auctionDetail.minimumPrice = BigInt.fromI32(0);
    auctionDetail.startingPrice = BigInt.fromI32(0);
    auctionDetail.stepDuration = BigInt.fromI32(0);
    auctionDetail.paymentToken = Bytes.empty();
    auctionDetail.currentBidder = Bytes.empty();
    auctionDetail.currentBid = BigInt.fromI32(0);
    auctionDetail.startTime = BigInt.fromI32(0);
    auctionDetail.endTime = BigInt.fromI32(0);
    auctionDetail.revealBlockNum = BigInt.fromI32(0);
    auctionDetail.bidStep = BigInt.fromI32(0);
    auctionDetail.revealStep = BigInt.fromI32(0);
    auctionDetail.sndBid = BigInt.fromI32(0);

    if(event.params.auctionType == BigInt.fromI32(0)) {
      let auctionContract = EnglishAuction.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.auctionCreator = auctionInfo.value.getValue0();
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.currentBidder = auctionInfo.value.getValue2();
        auctionDetail.currentBid = auctionInfo.value.getValue3();
        auctionDetail.startTime = auctionInfo.value.getValue4();
        auctionDetail.endTime = auctionInfo.value.getValue5();
        auctionDetail.bidStep = auctionInfo.value.getValue6();
        auctionDetail.paymentToken = auctionInfo.value.getValue7();
      } else {
        log.warning("Cannot get auctionInfo", []);
      }
    } else if(event.params.auctionType == BigInt.fromI32(1)) {
      let auctionContract = VickreyAuction.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.auctionCreator = auctionInfo.value.getValue0();
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.stepDuration = auctionInfo.value.getValue2();
        auctionDetail.endTime = auctionInfo.value.getValue3();
        auctionDetail.startTime = auctionInfo.value.getValue4();
        auctionDetail.revealBlockNum = auctionInfo.value.getValue5();
        auctionDetail.currentBidder = auctionInfo.value.getValue6();
        auctionDetail.currentBid = auctionInfo.value.getValue7();
        auctionDetail.sndBid = auctionInfo.value.getValue8();
      } else {
        log.warning("Cannot get auctionInfo", []);
      }
    } else if(event.params.auctionType == BigInt.fromI32(2)) {
      let auctionContract = DutchAuction.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.minimumPrice = auctionInfo.value.getValue0();
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.bidStep = auctionInfo.value.getValue2();
        auctionDetail.stepDuration = auctionInfo.value.getValue3();
        auctionDetail.paymentToken = auctionInfo.value.getValue4();
        auctionDetail.startTime = auctionInfo.value.getValue5();
        auctionDetail.auctionCreator = auctionInfo.value.getValue6();
      } else {
        log.warning("Cannot get nftinfo", []);
      }
    } else if(event.params.auctionType == BigInt.fromI32(3)) {
      let auctionContract = SealedBidAuctionV1.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.auctionCreator = auctionInfo.value.getValue0();
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.stepDuration = auctionInfo.value.getValue2();
        auctionDetail.endTime = auctionInfo.value.getValue3();
        auctionDetail.startTime = auctionInfo.value.getValue4();
        auctionDetail.revealBlockNum = auctionInfo.value.getValue5();
        auctionDetail.currentBidder = auctionInfo.value.getValue6();
        auctionDetail.currentBid = auctionInfo.value.getValue7();
      } else {
        log.warning("Cannot get nftinfo", []);
      }
    } else if(event.params.auctionType == BigInt.fromI32(4)) {
      let auctionContract = SealedBidAuctionV2.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.auctionCreator = auctionInfo.value.getValue0();
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.startTime = auctionInfo.value.getValue2();
        auctionDetail.endTime = auctionInfo.value.getValue3();
        auctionDetail.stepDuration = auctionInfo.value.getValue4();
        auctionDetail.paymentToken = auctionInfo.value.getValue5();
        auctionDetail.bidStep = auctionInfo.value.getValue6();
        auctionDetail.revealStep = auctionInfo.value.getValue7();
        auctionDetail.currentBid = auctionInfo.value.getValue8();
        auctionDetail.currentBidder = auctionInfo.value.getValue9();
      } else {
        log.warning("Cannot get nftinfo", []);
      }
    }
    auctionDetail.save();

    // Stat
    for(let i = 0; i < distinctNFTAddresses.length; i++){
      let collectionStat = Stat.load(`${auctionType}_0_${distinctNFTAddresses[i].toHexString()}`);
      if(!collectionStat){
        collectionStat = new Stat(`${auctionType}_0_${distinctNFTAddresses[i].toHexString()}`);
        collectionStat.auctionType = auctionType;
        collectionStat.entityAddress = distinctNFTAddresses[i];
        collectionStat.auctionCount = 1;
        collectionStat.statType = 0;
        collectionStat.volume = [];
      } else {
        collectionStat.auctionCount += 1;
      }
      collectionStat.save();
    }

    // AuctionCommon
    let auctionCommon = AuctionCommon.load(`${auctionType}`);
    if(!auctionCommon){
      auctionCommon = new AuctionCommon(`${auctionType}`);
      if(tokenIds.length > nftAddresses.length){
        auctionCommon.collectionCount = 1;
      } else {
        auctionCommon.collectionCount = distinctNFTAddresses.length;
      }
      auctionCommon.creatorCount = 1;
      auctionCommon.creatorList = [auctionDetail.auctionCreator];
      for(let i = 0; i < distinctNFTAddresses.length; i++){
        let nftAddress = Collection.load(distinctNFTAddresses[i]);
        if(!nftAddress) {
          nftAddress = new Collection(distinctNFTAddresses[i]);
          nftAddress.save();
        }
      }
      auctionCommon.collectionList = changetype<Bytes[]>(distinctNFTAddresses);
      auctionCommon.auctionCount = 1;
      auctionCommon.volume = [];
    } else {
      let collectionList = auctionCommon.collectionList;
      for(let i = 0; i < distinctNFTAddresses.length; i++){
        if (!collectionList.includes(distinctNFTAddresses[i])) {
          collectionList.push(distinctNFTAddresses[i]);
          auctionCommon.collectionCount += 1;
          let nftAddress = Collection.load(distinctNFTAddresses[i]);
          if(!nftAddress) {
            nftAddress = new Collection(distinctNFTAddresses[i]);
            nftAddress.save();
          }
        }
      }
      auctionCommon.collectionList = collectionList;
      auctionCommon.auctionCount += 1;
    }
    auctionCommon.save();
    
    // Trade
    let trade = new Trade(`${auctionDetail.auctionCreator.toHexString()}_${event.params.auction.toHexString()}_0`);
    trade.type = 0;
    trade.hash = event.transaction.hash;
    trade.auctioneer = auctionDetail.auctionCreator;
    trade.bidder = auctionDetail.auctionCreator;
    trade.price = BigInt.fromI32(0);
    trade.auctionDetail = event.params.auction;
    trade.timestamp = event.block.timestamp;
    trade.save();

    // User
    let user = User.load(auctionDetail.auctionCreator);
    if(!user) {
      user = new User(auctionDetail.auctionCreator);
      user.auctionBidded = [];
      user.biddedCollection = [];
      user.ownedCollectionCount = 1;
      user.biddedCollectionCount = 0;
      user.ownedCollection = changetype<Bytes[]>(distinctNFTAddresses);
      user.stats = [];
    } else {
      let ownedCollection = user.ownedCollection;
      for(let i = 0; i < distinctNFTAddresses.length; i++){
        if (!ownedCollection.includes(distinctNFTAddresses[i])) {
          ownedCollection.push(distinctNFTAddresses[i]);
          user.ownedCollectionCount += 1;
        }
      }
      user.ownedCollection = ownedCollection;
    }
    user.save();

    // Stat User
    let userStat = Stat.load(`${auctionType}_2_${auctionDetail.auctionCreator.toHexString()}`);
    if(!userStat){
      userStat = new Stat(`${auctionType}_2_${auctionDetail.auctionCreator.toHexString()}`);
      userStat.auctionType = auctionType;
      userStat.entityAddress = auctionDetail.auctionCreator;
      userStat.auctionCount = 1;
      userStat.statType = 2;
      userStat.volume = [];
      let stats = user.stats;
      stats.push(userStat.id);
      user.stats = stats;
      user.save();
    } else {
      userStat.auctionCount += 1;
    }
    userStat.save();

    // NFT
    if(tokenIds.length > nftAddresses.length){
      for(let i = 0; i < tokenIds.length; i++){
        let nft = NFT.load(`${nftAddresses[0].toHexString()}_${tokenIds[i].toString()}`);
        if(!nft){
          nft = new NFT(`${nftAddresses[0].toHexString()}_${tokenIds[i].toString()}`);
          nft.address = nftAddresses[0];
          nft.tokenId = tokenIds[i];
          nft.auctionDetail = [event.params.auction];
        } else {
          let nftAuctionDetail = nft.auctionDetail;
          nftAuctionDetail.push(event.params.auction);
          nft.auctionDetail = nftAuctionDetail;
        }
        nft.save();
      }
    } else {
      for(let i = 0; i < nftAddresses.length; i++){
        let nft = NFT.load(`${nftAddresses[i].toHexString()}_${tokenIds[i].toString()}`);
        if(!nft){
          nft = new NFT(`${nftAddresses[i].toHexString()}_${tokenIds[i].toString()}`);
          nft.address = nftAddresses[i];
          nft.tokenId = tokenIds[i];
          nft.auctionDetail = [event.params.auction];
        } else {
          let nftAuctionDetail = nft.auctionDetail;
          nftAuctionDetail.push(event.params.auction);
          nft.auctionDetail = nftAuctionDetail;
        }
        nft.save();
      }
    }
  }
}

export function handleBidAuction(event: BidAuction): void {
  let nftAddresses: Array<Address> = [];
  let auctionType = 0;
  let isFailed = false;
  if(event.params.auctionType == BigInt.fromI32(0)) {
    let auctionContract = EnglishAuction.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  } else if(event.params.auctionType == BigInt.fromI32(1)) {
    auctionType = 1;
    let auctionContract = VickreyAuction.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  } else if(event.params.auctionType == BigInt.fromI32(2)) {
    auctionType = 2;
    let auctionContract = DutchAuction.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  } else if(event.params.auctionType == BigInt.fromI32(3)) {
    auctionType = 3;
    let auctionContract = SealedBidAuctionV1.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  } else if(event.params.auctionType == BigInt.fromI32(4)) {
    auctionType = 4;
    let auctionContract = SealedBidAuctionV2.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  }

  if(isFailed == false){
    let distinctNFTAddresses = getDistinctAddresses(nftAddresses);

    let owner = Bytes.fromHexString("0x0000000000000000000000000000000000000000");
    let paymentToken = Bytes.fromHexString("0x0000000000000000000000000000000000000000");
    let auctionDetail = AuctionDetail.load(event.params.auction);
    if(auctionDetail){
      if(event.params.auctionType == BigInt.fromI32(0)) {
        let auctionContract = EnglishAuction.bind(event.params.auction);
        let auctionInfo = auctionContract.try_getAuctionInfo();
        if(!auctionInfo.reverted){
          auctionDetail.startingPrice = auctionInfo.value.getValue1();
          auctionDetail.currentBidder = auctionInfo.value.getValue2();
          auctionDetail.currentBid = auctionInfo.value.getValue3();
          auctionDetail.startTime = auctionInfo.value.getValue4();
          auctionDetail.endTime = auctionInfo.value.getValue5();
          auctionDetail.bidStep = auctionInfo.value.getValue6();
          auctionDetail.paymentToken = auctionInfo.value.getValue7();
        } else {
          log.warning("Cannot get auctionInfo", []);
        }
      } else if(event.params.auctionType == BigInt.fromI32(1)) {
        let auctionContract = VickreyAuction.bind(event.params.auction);
        let auctionInfo = auctionContract.try_getAuctionInfo();
        if(!auctionInfo.reverted){
          auctionDetail.startingPrice = auctionInfo.value.getValue1();
          auctionDetail.stepDuration = auctionInfo.value.getValue2();
          auctionDetail.endTime = auctionInfo.value.getValue3();
          auctionDetail.startTime = auctionInfo.value.getValue4();
          auctionDetail.revealBlockNum = auctionInfo.value.getValue5();
          auctionDetail.currentBidder = auctionInfo.value.getValue6();
          auctionDetail.currentBid = auctionInfo.value.getValue7();
          auctionDetail.sndBid = auctionInfo.value.getValue8();
        } else {
          log.warning("Cannot get auctionInfo", []);
        }
      } else if(event.params.auctionType == BigInt.fromI32(2)) {
        let auctionContract = DutchAuction.bind(event.params.auction);
        let auctionInfo = auctionContract.try_getAuctionInfo();
        if(!auctionInfo.reverted){
          auctionDetail.minimumPrice = auctionInfo.value.getValue0();
          auctionDetail.startingPrice = auctionInfo.value.getValue1();
          auctionDetail.bidStep = auctionInfo.value.getValue2();
          auctionDetail.stepDuration = auctionInfo.value.getValue3();
          auctionDetail.paymentToken = auctionInfo.value.getValue4();
          auctionDetail.startTime = auctionInfo.value.getValue5();
        } else {
          log.warning("Cannot get nftinfo", []);
        }
      } else if(event.params.auctionType == BigInt.fromI32(3)) {
        let auctionContract = SealedBidAuctionV1.bind(event.params.auction);
        let auctionInfo = auctionContract.try_getAuctionInfo();
        if(!auctionInfo.reverted){
          auctionDetail.startingPrice = auctionInfo.value.getValue1();
          auctionDetail.stepDuration = auctionInfo.value.getValue2();
          auctionDetail.endTime = auctionInfo.value.getValue3();
          auctionDetail.startTime = auctionInfo.value.getValue4();
          auctionDetail.revealBlockNum = auctionInfo.value.getValue5();
          auctionDetail.currentBidder = auctionInfo.value.getValue6();
          auctionDetail.currentBid = auctionInfo.value.getValue7();
        } else {
          log.warning("Cannot get nftinfo", []);
        }
      } else if(event.params.auctionType == BigInt.fromI32(4)) {
        let auctionContract = SealedBidAuctionV2.bind(event.params.auction);
        let auctionInfo = auctionContract.try_getAuctionInfo();
        if(!auctionInfo.reverted){
          auctionDetail.startingPrice = auctionInfo.value.getValue1();
          auctionDetail.startTime = auctionInfo.value.getValue2();
          auctionDetail.endTime = auctionInfo.value.getValue3();
          auctionDetail.stepDuration = auctionInfo.value.getValue4();
          auctionDetail.paymentToken = auctionInfo.value.getValue5();
          auctionDetail.bidStep = auctionInfo.value.getValue6();
          auctionDetail.revealStep = auctionInfo.value.getValue7();
          auctionDetail.currentBid = auctionInfo.value.getValue8();
          auctionDetail.currentBidder = auctionInfo.value.getValue9();
        } else {
          log.warning("Cannot get nftinfo", []);
        }
      }
      if(event.params.auctionType == BigInt.fromI32(2)){
        auctionDetail.currentBid = event.params.amount;
        auctionDetail.currentBidder = event.params.bidder;
      }
      paymentToken = auctionDetail.paymentToken;
      owner = auctionDetail.auctionCreator;
      auctionDetail.save();
    }

    // User
    let user = User.load(event.params.bidder);
    if(!user) {
      user = new User(event.params.bidder);
      user.auctionBidded = [event.params.auction];
      for(let i = 0; i < distinctNFTAddresses.length; i++){
        let nftAddress = Collection.load(distinctNFTAddresses[i]);
        if(!nftAddress) {
          nftAddress = new Collection(distinctNFTAddresses[i]);
          nftAddress.save();
        }
      }
      user.biddedCollection = changetype<Bytes[]>(distinctNFTAddresses);
      user.ownedCollection = [];
      user.ownedCollectionCount = 0;
      user.biddedCollectionCount = distinctNFTAddresses.length;
      user.stats = [];
    } else {
      let auctionBidded = user.auctionBidded;
      if(!auctionBidded.includes(event.params.auction)){
        auctionBidded.push(event.params.auction);
      }
      user.auctionBidded = auctionBidded;
      let biddedCollection = user.biddedCollection;
      for(let i = 0; i < distinctNFTAddresses.length; i++){
        if(!biddedCollection.includes(distinctNFTAddresses[i])){
          biddedCollection.push(distinctNFTAddresses[i]);
          user.biddedCollectionCount += 1;
          let nftAddress = Collection.load(distinctNFTAddresses[i]);
          if(!nftAddress) {
            nftAddress = new Collection(distinctNFTAddresses[i]);
            nftAddress.save();
          }
        }
      }
      user.biddedCollection = biddedCollection;
    }
    user.save();
    
    // Stat User bid
    let userBidStat = Stat.load(`${auctionType}_1_${event.params.bidder.toHexString()}`);
    if(!userBidStat) {
      userBidStat = new Stat(`${auctionType}_1_${event.params.bidder.toHexString()}`);
      userBidStat.auctionType = auctionType;
      userBidStat.entityAddress = event.params.bidder;
      userBidStat.auctionCount = 1;
      userBidStat.statType = 1;
      userBidStat.volume = [];
      let userStats = user.stats;
      userStats.push(userBidStat.id);
      user.stats = userStats;
      user.save();
    } else {
      userBidStat.auctionCount += 1;
    }
    userBidStat.save();

    // Volume user bid
    let userBidVol = Volume.load(`${auctionType}_1_${event.params.bidder.toHexString()}_${paymentToken.toHexString()}`);
    if(!userBidVol) {
      userBidVol = new Volume(`${auctionType}_1_${event.params.bidder.toHexString()}_${paymentToken.toHexString()}`);
      userBidVol.paymentToken = paymentToken;
      userBidVol.amount = event.params.amount;
      let userBidStatVol = userBidStat.volume;
      userBidStatVol.push(`${auctionType}_1_${event.params.bidder.toHexString()}_${paymentToken.toHexString()}`);
      userBidStat.volume = userBidStatVol;
      userBidStat.save();
    } else {
      userBidVol.amount = userBidVol.amount.plus(event.params.amount);
    }
    userBidVol.save();

    let trade = new Trade(`${event.params.bidder.toHexString()}_${event.params.auction.toHexString()}_1_${event.block.timestamp.toString()}`);
    trade.type = 1;
    trade.hash = event.transaction.hash;
    trade.auctioneer = owner;
    trade.bidder = event.params.bidder;
    trade.price = event.params.amount;
    trade.auctionDetail = event.params.auction;
    trade.timestamp = event.block.timestamp;
    trade.save();
  }
}

export function handleAuctionFinalized(event: AuctionFinalized): void {
  let nftAddresses: Array<Address> = [];
  let isFailed = false;
  let auctionType = 0;
  if(event.params.auctionType == BigInt.fromI32(0)) {
    let auctionContract = EnglishAuction.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  } else if(event.params.auctionType == BigInt.fromI32(1)) {
    auctionType = 1;
    let auctionContract = VickreyAuction.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  } else if(event.params.auctionType == BigInt.fromI32(2)) {
    auctionType = 2;
    let auctionContract = DutchAuction.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  } else if(event.params.auctionType == BigInt.fromI32(3)) {
    auctionType = 3;
    let auctionContract = SealedBidAuctionV1.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  } else if(event.params.auctionType == BigInt.fromI32(4)) {
    auctionType = 4;
    let auctionContract = SealedBidAuctionV2.bind(event.params.auction);
    let nftInfo = auctionContract.try_getNFTInfo();
    if(!nftInfo.reverted){
      nftAddresses = nftInfo.value.getValue0();
    } else {
      log.warning("Cannot get nftinfo", []);
      isFailed = true;
    }
  }
  if(!isFailed){
    let distinctNFTAddresses = getDistinctAddresses(nftAddresses);

    // AuctionDetail
    let auctionDetail = AuctionDetail.load(event.params.auction);
    let paymentToken = Bytes.fromHexString("0x0000000000000000000000000000000000000000");
    if(auctionDetail){
      auctionDetail.status = 1;
      if(event.params.auctionType == BigInt.fromI32(0)) {
        let auctionContract = EnglishAuction.bind(event.params.auction);
        let auctionInfo = auctionContract.try_getAuctionInfo();
        if(!auctionInfo.reverted){
          auctionDetail.startingPrice = auctionInfo.value.getValue1();
          auctionDetail.currentBidder = auctionInfo.value.getValue2();
          auctionDetail.currentBid = auctionInfo.value.getValue3();
          auctionDetail.startTime = auctionInfo.value.getValue4();
          auctionDetail.endTime = auctionInfo.value.getValue5();
          auctionDetail.bidStep = auctionInfo.value.getValue6();
          auctionDetail.paymentToken = auctionInfo.value.getValue7();
        } else {
          log.warning("Cannot get auctionInfo", []);
        }
      } else if(event.params.auctionType == BigInt.fromI32(1)) {
        let auctionContract = VickreyAuction.bind(event.params.auction);
        let auctionInfo = auctionContract.try_getAuctionInfo();
        if(!auctionInfo.reverted){
          auctionDetail.startingPrice = auctionInfo.value.getValue1();
          auctionDetail.stepDuration = auctionInfo.value.getValue2();
          auctionDetail.endTime = auctionInfo.value.getValue3();
          auctionDetail.startTime = auctionInfo.value.getValue4();
          auctionDetail.revealBlockNum = auctionInfo.value.getValue5();
          auctionDetail.currentBidder = auctionInfo.value.getValue6();
          auctionDetail.currentBid = auctionInfo.value.getValue7();
          auctionDetail.sndBid = auctionInfo.value.getValue8();
        } else {
          log.warning("Cannot get auctionInfo", []);
        }
      } else if(event.params.auctionType == BigInt.fromI32(2)) {
        let auctionContract = DutchAuction.bind(event.params.auction);
        let auctionInfo = auctionContract.try_getAuctionInfo();
        if(!auctionInfo.reverted){
          auctionDetail.minimumPrice = auctionInfo.value.getValue0();
          auctionDetail.startingPrice = auctionInfo.value.getValue1();
          auctionDetail.bidStep = auctionInfo.value.getValue2();
          auctionDetail.stepDuration = auctionInfo.value.getValue3();
          auctionDetail.paymentToken = auctionInfo.value.getValue4();
          auctionDetail.startTime = auctionInfo.value.getValue5();
        } else {
          log.warning("Cannot get nftinfo", []);
        }
      } else if(event.params.auctionType == BigInt.fromI32(3)) {
        let auctionContract = SealedBidAuctionV1.bind(event.params.auction);
        let auctionInfo = auctionContract.try_getAuctionInfo();
        if(!auctionInfo.reverted){
          auctionDetail.startingPrice = auctionInfo.value.getValue1();
          auctionDetail.stepDuration = auctionInfo.value.getValue2();
          auctionDetail.endTime = auctionInfo.value.getValue3();
          auctionDetail.startTime = auctionInfo.value.getValue4();
          auctionDetail.revealBlockNum = auctionInfo.value.getValue5();
          auctionDetail.currentBidder = auctionInfo.value.getValue6();
          auctionDetail.currentBid = auctionInfo.value.getValue7();
        } else {
          log.warning("Cannot get nftinfo", []);
        }
      } else if(event.params.auctionType == BigInt.fromI32(4)) {
        let auctionContract = SealedBidAuctionV2.bind(event.params.auction);
        let auctionInfo = auctionContract.try_getAuctionInfo();
        if(!auctionInfo.reverted){
          auctionDetail.startingPrice = auctionInfo.value.getValue1();
          auctionDetail.startTime = auctionInfo.value.getValue2();
          auctionDetail.endTime = auctionInfo.value.getValue3();
          auctionDetail.stepDuration = auctionInfo.value.getValue4();
          auctionDetail.paymentToken = auctionInfo.value.getValue5();
          auctionDetail.bidStep = auctionInfo.value.getValue6();
          auctionDetail.revealStep = auctionInfo.value.getValue7();
          auctionDetail.currentBid = auctionInfo.value.getValue8();
          auctionDetail.currentBidder = auctionInfo.value.getValue9();
        } else {
          log.warning("Cannot get nftinfo", []);
        }
      }
      auctionDetail.save();
      if(auctionDetail.paymentToken != Bytes.empty()) {
        paymentToken = auctionDetail.paymentToken;
      }

      // Trade
      let trade = new Trade(`${auctionDetail.auctionCreator.toHexString()}_${event.params.auction.toHexString()}_3`);
      trade.type = 3;
      trade.hash = event.transaction.hash;
      trade.auctioneer = auctionDetail.auctionCreator;
      trade.bidder = auctionDetail.auctionCreator;
      trade.price = BigInt.fromI32(0);
      trade.auctionDetail = event.params.auction;
      trade.timestamp = event.block.timestamp;
      trade.save();

      // Volume collection
      // Stat collection
      for(let i = 0; i < distinctNFTAddresses.length; i++){
        let volumeCollection = Volume.load(`${auctionType}_0_${distinctNFTAddresses[i].toHexString()}_${paymentToken.toHexString()}`);
        if(!volumeCollection) {
          volumeCollection = new Volume(`${auctionType}_0_${distinctNFTAddresses[i].toHexString()}_${paymentToken.toHexString()}`);
          volumeCollection.paymentToken = paymentToken;
          volumeCollection.amount = auctionDetail.currentBid;
        } else {
          volumeCollection.amount = volumeCollection.amount.plus(auctionDetail.currentBid);
        }
        volumeCollection.save();
        let stat = Stat.load(`${auctionType}_0_${distinctNFTAddresses[i].toHexString()}`);
        if(stat) {
          let statVolume = stat.volume;
          statVolume.push(`${auctionType}_0_${distinctNFTAddresses[i].toHexString()}_${paymentToken.toHexString()}`);
          stat.volume = statVolume;
          stat.save();
        }
      }

      // AuctionCommon
      let auctionCommonVolume = Volume.load(`${auctionType}_${paymentToken.toHexString()}`);
      if(!auctionCommonVolume) {
        auctionCommonVolume = new Volume(`${auctionType}_${paymentToken.toHexString()}`);
        auctionCommonVolume.paymentToken = paymentToken;
        auctionCommonVolume.amount = auctionDetail.currentBid;
        let auctionCommon = AuctionCommon.load(`${auctionType}`);
        if(auctionCommon){
          let auctionVol = auctionCommon.volume;
          auctionVol.push(`${auctionType}_${paymentToken.toHexString()}`);
          auctionCommon.volume = auctionVol;
          auctionCommon.save();
        }
      } else {
        auctionCommonVolume.amount = auctionCommonVolume.amount.plus(auctionDetail.currentBid);
      }
      auctionCommonVolume.save();

      // Stat Volume user created
      let ownedAuctionStat = Stat.load(`${auctionType}_2_${auctionDetail.auctionCreator.toHexString()}`);
      let ownedAuctionVol = Volume.load(`${auctionType}_2_${auctionDetail.auctionCreator.toHexString()}_${paymentToken.toHexString()}`);
      if(!ownedAuctionVol){
        ownedAuctionVol = new Volume(`${auctionType}_2_${auctionDetail.auctionCreator.toHexString()}_${paymentToken.toHexString()}`);
        ownedAuctionVol.paymentToken = paymentToken;
        ownedAuctionVol.amount = auctionDetail.currentBid;
        if(ownedAuctionStat){
          let ownedAuctionStatVolume = ownedAuctionStat.volume;
          ownedAuctionStatVolume.push(`${auctionType}_2_${auctionDetail.auctionCreator.toHexString()}_${paymentToken.toHexString()}`);
          ownedAuctionStat.volume = ownedAuctionStatVolume;
          ownedAuctionStat.save();
        }
      } else {
        ownedAuctionVol.amount = ownedAuctionVol.amount.plus(auctionDetail.currentBid);
      }
      ownedAuctionVol.save();
    }
  }
}

export function handleRevealAuction(event: RevealAuction): void {
  let auctionDetail = AuctionDetail.load(event.params.auction);
  if(auctionDetail){
    if(event.params.auctionType == BigInt.fromI32(0)) {
      let auctionContract = EnglishAuction.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.currentBidder = auctionInfo.value.getValue2();
        auctionDetail.currentBid = auctionInfo.value.getValue3();
        auctionDetail.startTime = auctionInfo.value.getValue4();
        auctionDetail.endTime = auctionInfo.value.getValue5();
        auctionDetail.bidStep = auctionInfo.value.getValue6();
        auctionDetail.paymentToken = auctionInfo.value.getValue7();
      } else {
        log.warning("Cannot get auctionInfo", []);
      }
    } else if(event.params.auctionType == BigInt.fromI32(1)) {
      let auctionContract = VickreyAuction.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.stepDuration = auctionInfo.value.getValue2();
        auctionDetail.endTime = auctionInfo.value.getValue3();
        auctionDetail.startTime = auctionInfo.value.getValue4();
        auctionDetail.revealBlockNum = auctionInfo.value.getValue5();
        auctionDetail.currentBidder = auctionInfo.value.getValue6();
        auctionDetail.currentBid = auctionInfo.value.getValue7();
        auctionDetail.sndBid = auctionInfo.value.getValue8();
      } else {
        log.warning("Cannot get auctionInfo", []);
      }
    } else if(event.params.auctionType == BigInt.fromI32(2)) {
      let auctionContract = DutchAuction.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.minimumPrice = auctionInfo.value.getValue0();
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.bidStep = auctionInfo.value.getValue2();
        auctionDetail.stepDuration = auctionInfo.value.getValue3();
        auctionDetail.paymentToken = auctionInfo.value.getValue4();
        auctionDetail.startTime = auctionInfo.value.getValue5();
      } else {
        log.warning("Cannot get nftinfo", []);
      }
    } else if(event.params.auctionType == BigInt.fromI32(3)) {
      let auctionContract = SealedBidAuctionV1.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.stepDuration = auctionInfo.value.getValue2();
        auctionDetail.endTime = auctionInfo.value.getValue3();
        auctionDetail.startTime = auctionInfo.value.getValue4();
        auctionDetail.revealBlockNum = auctionInfo.value.getValue5();
        auctionDetail.currentBidder = auctionInfo.value.getValue6();
        auctionDetail.currentBid = auctionInfo.value.getValue7();
      } else {
        log.warning("Cannot get nftinfo", []);
      }
    } else if(event.params.auctionType == BigInt.fromI32(4)) {
      let auctionContract = SealedBidAuctionV2.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.startTime = auctionInfo.value.getValue2();
        auctionDetail.endTime = auctionInfo.value.getValue3();
        auctionDetail.stepDuration = auctionInfo.value.getValue4();
        auctionDetail.paymentToken = auctionInfo.value.getValue5();
        auctionDetail.bidStep = auctionInfo.value.getValue6();
        auctionDetail.revealStep = auctionInfo.value.getValue7();
        auctionDetail.currentBid = auctionInfo.value.getValue8();
        auctionDetail.currentBidder = auctionInfo.value.getValue9();
      } else {
        log.warning("Cannot get nftinfo", []);
      }
    }
    auctionDetail.save();

    let trade = new Trade(`${event.params.revealer.toHexString()}_${event.params.auction.toHexString()}_4_${event.block.timestamp.toString()}`);
    trade.type = 4;
    trade.hash = event.transaction.hash;
    trade.auctioneer = auctionDetail.auctionCreator;
    trade.bidder = event.params.revealer;
    trade.price = event.params.actualAmount;
    trade.auctionDetail = event.params.auction;
    trade.timestamp = event.block.timestamp;
    trade.save();
  }
}

export function handleRevealStarted(event: RevealStarted): void {
  let auctionDetail = AuctionDetail.load(event.params.auction);
  if(auctionDetail){
    if(event.params.auctionType == BigInt.fromI32(0)) {
      let auctionContract = EnglishAuction.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.currentBidder = auctionInfo.value.getValue2();
        auctionDetail.currentBid = auctionInfo.value.getValue3();
        auctionDetail.startTime = auctionInfo.value.getValue4();
        auctionDetail.endTime = auctionInfo.value.getValue5();
        auctionDetail.bidStep = auctionInfo.value.getValue6();
        auctionDetail.paymentToken = auctionInfo.value.getValue7();
      } else {
        log.warning("Cannot get auctionInfo", []);
      }
    } else if(event.params.auctionType == BigInt.fromI32(1)) {
      let auctionContract = VickreyAuction.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.stepDuration = auctionInfo.value.getValue2();
        auctionDetail.endTime = auctionInfo.value.getValue3();
        auctionDetail.startTime = auctionInfo.value.getValue4();
        auctionDetail.revealBlockNum = auctionInfo.value.getValue5();
        auctionDetail.currentBidder = auctionInfo.value.getValue6();
        auctionDetail.currentBid = auctionInfo.value.getValue7();
        auctionDetail.sndBid = auctionInfo.value.getValue8();
      } else {
        log.warning("Cannot get auctionInfo", []);
      }
    } else if(event.params.auctionType == BigInt.fromI32(2)) {
      let auctionContract = DutchAuction.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.minimumPrice = auctionInfo.value.getValue0();
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.bidStep = auctionInfo.value.getValue2();
        auctionDetail.stepDuration = auctionInfo.value.getValue3();
        auctionDetail.paymentToken = auctionInfo.value.getValue4();
        auctionDetail.startTime = auctionInfo.value.getValue5();
      } else {
        log.warning("Cannot get nftinfo", []);
      }
    } else if(event.params.auctionType == BigInt.fromI32(3)) {
      let auctionContract = SealedBidAuctionV1.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.stepDuration = auctionInfo.value.getValue2();
        auctionDetail.endTime = auctionInfo.value.getValue3();
        auctionDetail.startTime = auctionInfo.value.getValue4();
        auctionDetail.revealBlockNum = auctionInfo.value.getValue5();
        auctionDetail.currentBidder = auctionInfo.value.getValue6();
        auctionDetail.currentBid = auctionInfo.value.getValue7();
      } else {
        log.warning("Cannot get nftinfo", []);
      }
    } else if(event.params.auctionType == BigInt.fromI32(4)) {
      let auctionContract = SealedBidAuctionV2.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.startTime = auctionInfo.value.getValue2();
        auctionDetail.endTime = auctionInfo.value.getValue3();
        auctionDetail.stepDuration = auctionInfo.value.getValue4();
        auctionDetail.paymentToken = auctionInfo.value.getValue5();
        auctionDetail.bidStep = auctionInfo.value.getValue6();
        auctionDetail.revealStep = auctionInfo.value.getValue7();
        auctionDetail.currentBid = auctionInfo.value.getValue8();
        auctionDetail.currentBidder = auctionInfo.value.getValue9();
      } else {
        log.warning("Cannot get nftinfo", []);
      }
    }
    auctionDetail.save();

    let trade = new Trade(`${event.transaction.from.toHexString()}_${event.params.auction.toHexString()}_5`);
    trade.type = 5;
    trade.hash = event.transaction.hash;
    trade.auctioneer = auctionDetail.auctionCreator;
    trade.bidder = event.transaction.from;
    trade.price = BigInt.fromI32(0);
    trade.auctionDetail = event.params.auction;
    trade.timestamp = event.block.timestamp;
    trade.save();
  }
}

export function handleUpdateAuction(event: UpdateAuction): void {
  let auctionDetail = AuctionDetail.load(event.params.auction);
  if(auctionDetail){
    if(event.params.auctionType == BigInt.fromI32(0)) {
      let auctionContract = EnglishAuction.bind(event.params.auction);
      let auctionInfo = auctionContract.try_getAuctionInfo();
      if(!auctionInfo.reverted){
        auctionDetail.startingPrice = auctionInfo.value.getValue1();
        auctionDetail.currentBidder = auctionInfo.value.getValue2();
        auctionDetail.currentBid = auctionInfo.value.getValue3();
        auctionDetail.startTime = auctionInfo.value.getValue4();
        auctionDetail.endTime = auctionInfo.value.getValue5();
        auctionDetail.bidStep = auctionInfo.value.getValue6();
        auctionDetail.paymentToken = auctionInfo.value.getValue7();
      } else {
        log.warning("Cannot get auctionInfo", []);
      }
    }
    auctionDetail.save();

    let trade = new Trade(`${auctionDetail.auctionCreator.toHexString()}_${event.params.auction.toHexString()}_2_${event.block.timestamp.toString()}`);
    trade.type = 2;
    trade.hash = event.transaction.hash;
    trade.auctioneer = auctionDetail.auctionCreator;
    trade.bidder = auctionDetail.auctionCreator;
    trade.price = BigInt.fromI32(0);
    trade.auctionDetail = event.params.auction;
    trade.timestamp = event.block.timestamp;
    trade.save();
  }
}

export function handleInitialized(event: Initialized): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleUnpaused(event: Unpaused): void {}

export function handlePaused(event: Paused): void {}
