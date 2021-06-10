import express from "express";
import { getAllArtCount, getAllSimplifiedArts } from "./allArts.js";
import { getUserArtCount, getUserSimplifiedArts } from "./userArts.js";
import mongodb from "mongodb";

const router = express.Router();

router.post("/artCount", async (request, response) => {
  // const { userId } = request.query;
  // if (Boolean(userId) && !validateUserId(userId))
  //   response.status(400).json({ success: false });

  // try {
  //   const count = Boolean(userId)
  //     ? await getUserArtCount(new mongodb.ObjectId(userId))
  //     : await getAllArtCount();

  //   if (!Boolean(count) && count !== 0)
  //     return response.status(500).json({ success: false });

  //   return response.status(200).json({ success: true, payload: count });
  // } catch (error) {
  //   console.log(error);
  //   return response.status(500).json({ success: false });
  // }

  const { selectors } = request.body;
  const selector = selectors.find((element) => element.payload !== null);

  if (Boolean(selector) && !validateUserId(selector.payload))
    response.status(400).json({ success: false });

  try {
    const count = Boolean(selector)
      ? await getUserArtCount(selector)
      : await getAllArtCount();

    if (!Boolean(count) && count !== 0)
      return response.status(500).json({ success: false });

    return response.status(200).json({ success: true, payload: count });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ success: false });
  }
});

router.post(
  "/simplifiedArts/:pageIndex/:pageSize",
  async (request, response) => {
    //   const params = request.params;
    //   const pageIndex = parseInt(params.pageIndex);
    //   const pageSize = parseInt(params.pageSize);

    //   if (!validatePageIndexAndPageSize(pageIndex, pageSize))
    //     return response.status(400).json({ success: false });

    //   const { userId } = request.query;
    //   if (Boolean(userId) && !validateUserId(userId))
    //     return response.status(400).json({ success: false });

    //   try {
    //     const simplifiedArts = Boolean(userId)
    //       ? await getUserSimplifiedArts(
    //           new mongodb.ObjectId(userId),
    //           pageIndex,
    //           pageSize
    //         )
    //       : await getAllSimplifiedArts(pageIndex, pageSize);

    //     return response
    //       .status(200)
    //       .json({ success: true, payload: simplifiedArts });
    //   } catch (error) {
    //     console.log(error);
    //     return response.status(500).json({ success: false });
    //   }
    // }

    const params = request.params;
    const pageIndex = parseInt(params.pageIndex);
    const pageSize = parseInt(params.pageSize);

    if (!validatePageIndexAndPageSize(pageIndex, pageSize))
      return response.status(400).json({ success: false });

    const { selectors } = request.body;
    const selector = selectors.find((element) => element.payload !== null);

    try {
      const simplifiedArts = Boolean(selector)
        ? await getUserSimplifiedArts(selector, pageIndex, pageSize)
        : await getAllSimplifiedArts(pageIndex, pageSize);

      return response
        .status(200)
        .json({ success: true, payload: simplifiedArts });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ success: false });
    }
  }
);

function validatePageIndexAndPageSize(pageIndex, pageSize) {
  return !(
    isNaN(pageIndex) ||
    isNaN(pageSize) ||
    pageIndex < 0 ||
    pageSize < 1 ||
    pageSize > 12
  );
}

function validateUserId(userId) {
  return typeof userId === "string" && userId.length === 24;
}

export default router;
