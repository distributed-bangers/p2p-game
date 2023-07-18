import { Request, Response } from 'express';

export const getGames = async (req: Request, res: Response) => {
  try {
    // console.log(req);
    // console.log('here are your games');
    console.log(req);
    // res.status(200).send(req);
    res.send(req.route);
  } catch (error) {}
};
